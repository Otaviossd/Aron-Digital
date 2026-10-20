import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscription, planFromId, verifyWebhook } from "@/lib/paypal";
import { sendWelcomeEmail } from "@/lib/email";

type PayPalEvent = {
  id: string;
  event_type: string;
  resource: {
    id?: string;
    billing_agreement_id?: string;
    [key: string]: unknown;
  };
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  let event: PayPalEvent;
  try {
    event = JSON.parse(raw) as PayPalEvent;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // 1) Autenticidade
  const valid = await verifyWebhook(request.headers, event);
  if (!valid) return NextResponse.json({ error: "invalid signature" }, { status: 401 });

  const admin = createAdminClient();

  // 2) Idempotência: o PayPal reenvia eventos. Se já processamos, responde 200 e sai.
  const { error: dupError } = await admin
    .from("webhook_events")
    .insert({ id: event.id, event_type: event.event_type, payload: event });
  if (dupError) {
    if (dupError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ error: dupError.message }, { status: 500 });
  }

  try {
    await handleEvent(admin, event);
  } catch (err) {
    // Desfaz o registro para o PayPal poder reenviar e tentarmos de novo.
    await admin.from("webhook_events").delete().eq("id", event.id);
    console.error("webhook error", event.event_type, err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function handleEvent(admin: ReturnType<typeof createAdminClient>, event: PayPalEvent) {
  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const subId = event.resource.id!;
      const sub = await getSubscription(subId);
      const payerEmail = sub.subscriber?.email_address?.toLowerCase() ?? null;
      // E-mail de acesso digitado no checkout (custom_id) tem prioridade sobre o e-mail do PayPal.
      const accessEmail = (sub.custom_id?.includes("@") ? sub.custom_id : payerEmail)?.toLowerCase();
      if (!accessEmail) throw new Error("Assinatura sem e-mail");

      const plan = planFromId(sub.plan_id);
      const { data: row, error } = await admin
        .from("subscriptions")
        .upsert(
          {
            email: accessEmail,
            payer_email: payerEmail,
            paypal_subscription_id: subId,
            plan,
            status: "active",
            purchased_at: sub.start_time ?? new Date().toISOString(),
            access_until: sub.billing_info?.next_billing_time ?? null,
          },
          { onConflict: "paypal_subscription_id" },
        )
        .select("id, welcome_sent_at")
        .single();
      if (error) throw error;

      // A pessoa comprou: para a sequência de carrinho abandonado (e-mail de acesso ou do PayPal)
      const emailsLead = [accessEmail, payerEmail].filter((e): e is string => !!e);
      await admin
        .from("leads")
        .update({ converted_at: new Date().toISOString() })
        .in("email", emailsLead)
        .is("converted_at", null);

      if (!row.welcome_sent_at) {
        await sendWelcomeEmail({ to: accessEmail, plan });
        await admin
          .from("subscriptions")
          .update({ welcome_sent_at: new Date().toISOString() })
          .eq("id", row.id);
      }
      return;
    }

    case "PAYMENT.SALE.COMPLETED": {
      // Renovação: estende o acesso até a próxima cobrança.
      const subId = event.resource.billing_agreement_id;
      if (!subId) return;
      const sub = await getSubscription(subId);
      await admin
        .from("subscriptions")
        .update({
          status: "active",
          access_until: sub.billing_info?.next_billing_time ?? null,
        })
        .eq("paypal_subscription_id", subId);
      return;
    }

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED":
    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      const subId = event.resource.id!;
      const status =
        event.event_type === "BILLING.SUBSCRIPTION.CANCELLED"
          ? "cancelled"
          : event.event_type === "BILLING.SUBSCRIPTION.EXPIRED"
            ? "expired"
            : "suspended";
      // Cancelou: mantém o acesso até o fim do período já pago (access_until não muda).
      await admin.from("subscriptions").update({ status }).eq("paypal_subscription_id", subId);
      return;
    }

    case "PAYMENT.SALE.REFUNDED": {
      const subId = event.resource.billing_agreement_id;
      if (!subId) return;
      await admin
        .from("subscriptions")
        .update({ refunded_at: new Date().toISOString(), status: "cancelled" })
        .eq("paypal_subscription_id", subId);
      return;
    }

    default:
      return;
  }
}

import Link from "next/link";
import { BRAND } from "@/lib/config";
import { construirMapa } from "@/lib/emails/mapa";
import MapaEmails from "@/components/admin/MapaEmails";
import { Titulo } from "@/components/admin/ui";

export const metadata = { title: "Mapa de emails" };

export default function MapaPage() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.lanuevaolaacademy.com").replace(/\/$/, "");
  const { NODOS, ARISTAS, EMAILS } = construirMapa({ siteUrl, marca: BRAND });
  const total = Object.keys(EMAILS).length;

  return (
    <>
      <Titulo
        titulo="Mapa de emails"
        sub={`Todos los caminos que puede hacer una persona hasta comprar, y los ${total} emails de cada camino, con el diseño real que recibe.`}
        derecha={
          <Link href="/admin/email" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            ← Volver a Email marketing
          </Link>
        }
      />
      <MapaEmails nodos={NODOS} aristas={ARISTAS} emails={EMAILS} />
    </>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import PuertaAcceso from "@/components/PuertaAcceso";

export const metadata: Metadata = { title: "Panel del equipo", robots: { index: false } };

export default function EquipoPage(props: PageProps<"/equipo">) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <PuertaAcceso modo="equipo" searchParams={props.searchParams} />
    </Suspense>
  );
}

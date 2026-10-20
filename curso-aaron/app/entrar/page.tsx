import { Suspense } from "react";
import PuertaAcceso from "@/components/PuertaAcceso";

export default function EntrarPage(props: PageProps<"/entrar">) {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <PuertaAcceso modo="alumno" searchParams={props.searchParams} />
    </Suspense>
  );
}

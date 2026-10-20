// Foto de perfil redonda; sin foto, muestra la inicial del email.
export default function Avatar({ url, email, size = 40 }: { url?: string | null; email: string; size?: number }) {
  const medida = { width: size, height: size };
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" style={medida} className="shrink-0 rounded-full border border-line-strong object-cover" />
  ) : (
    <span
      style={{ ...medida, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full border border-line-strong bg-white/[0.06] font-medium uppercase text-ink/80"
    >
      {email.charAt(0)}
    </span>
  );
}

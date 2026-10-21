import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Capas enviadas pelo painel de admin passam por Server Actions (padrão é 1MB).
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  // Atalho: quem digitar /vendas cai em /ventas (as páginas ficam em espanhol, o público é hispano).
  async redirects() {
    // Atajos: cualquiera de estas direcciones lleva a la página correcta.
    return [
      { source: "/vendas", destination: "/ventas", permanent: false },
      { source: "/venta", destination: "/ventas", permanent: false },
      { source: "/login", destination: "/entrar", permanent: false },
      { source: "/acceso", destination: "/entrar", permanent: false },
      { source: "/alumnos", destination: "/aulas", permanent: false },
      { source: "/panel", destination: "/admin", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

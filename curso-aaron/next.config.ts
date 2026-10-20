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
    return [{ source: "/vendas", destination: "/ventas", permanent: false }];
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

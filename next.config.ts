import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/tabela", destination: "/painel/tabela", permanent: false },
    { source: "/evolucao", destination: "/painel/evolucao", permanent: false },
    { source: "/comparacao", destination: "/painel/comparacao", permanent: false },
    { source: "/ods", destination: "/painel/ods", permanent: false },
  ],
};

export default nextConfig;

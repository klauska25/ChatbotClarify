import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A rota do chat lê o system prompt do disco em tempo de execução. Sem esta linha,
  // a Vercel não copia o arquivo para a função e o bot ficaria com o texto reserva.
  outputFileTracingIncludes: {
    "/api/chat": ["./prompts/system.md"],
  },
};

export default nextConfig;

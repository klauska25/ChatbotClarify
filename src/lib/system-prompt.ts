import { readFile } from "node:fs/promises";
import path from "node:path";

// Instruções do atendente. O next.config.ts inclui este arquivo na publicação da Vercel
// (outputFileTracingIncludes); sem isso ele não existiria no servidor.
const SYSTEM_PROMPT_PATH = path.join(process.cwd(), "prompts", "system.md");

// Usado só se o arquivo sumir, para o bot continuar atendendo com o básico.
const FALLBACK_SYSTEM_PROMPT =
  "Você é o atendente de suporte do TimeTrack, um sistema de ponto eletrônico. " +
  "Responda em português, com educação e frases curtas. Para problemas de acesso, peça o email. " +
  "Nunca informe preços: ofereça um atendente humano. Recuse assuntos fora do TimeTrack.";

// Guardado depois da primeira leitura: o arquivo não muda enquanto o servidor está de pé.
let cachedPrompt: string | undefined;

export async function loadSystemPrompt(): Promise<string> {
  if (cachedPrompt !== undefined) return cachedPrompt;

  try {
    const content = (await readFile(SYSTEM_PROMPT_PATH, "utf8")).trim();
    cachedPrompt = content.length > 0 ? content : FALLBACK_SYSTEM_PROMPT;
  } catch {
    cachedPrompt = FALLBACK_SYSTEM_PROMPT;
  }
  return cachedPrompt;
}

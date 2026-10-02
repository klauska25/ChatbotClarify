// Validação e corte do histórico que o navegador manda para /api/chat.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Só as mensagens mais recentes vão para o cérebro: conversas longas ficariam lentas e caras.
const MAX_MESSAGES = 20;

const MAX_MESSAGE_LENGTH = 4000;

export type ParseResult =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; message: string };

// Recebe o corpo já convertido de JSON e devolve o histórico pronto para envio,
// ou uma mensagem amigável explicando o que está errado.
export function parseChatMessages(body: unknown): ParseResult {
  if (!isRecord(body) || !Array.isArray(body.messages)) {
    return { ok: false, message: "Não entendi a mensagem enviada. Tente novamente." };
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (!isChatMessage(item)) {
      return { ok: false, message: "Não entendi a mensagem enviada. Tente novamente." };
    }
    if (item.content.length > MAX_MESSAGE_LENGTH) {
      return {
        ok: false,
        message: `Sua mensagem é muito longa. Escreva no máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
      };
    }
    messages.push({ role: item.role, content: item.content });
  }

  const trimmed = trimHistory(messages);
  if (trimmed.length === 0) {
    return { ok: false, message: "Escreva uma mensagem para começar a conversa." };
  }
  return { ok: true, messages: trimmed };
}

// Fica com as últimas mensagens e descarta as do atendente que sobrarem no começo:
// a conversa enviada ao cérebro precisa sempre começar por uma mensagem do usuário.
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-MAX_MESSAGES);
  const firstUserIndex = recent.findIndex((message) => message.role === "user");
  return firstUserIndex === -1 ? [] : recent.slice(firstUserIndex);
}

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

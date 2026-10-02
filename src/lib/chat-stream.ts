// Conversa com /api/chat a partir do navegador e lê a resposta aos pedaços.
// Formato dos eventos: docs/timetrack-api.md, seção 8. Cada evento é uma linha
// "data: {json}" terminada por uma linha em branco.

import type { MessageRole, ToolUse } from "./types";

export interface ChatHistoryItem {
  role: MessageRole;
  content: string;
}

export interface ChatStreamHandlers {
  // Chamado a cada pedaço de texto da resposta, na ordem em que chegam.
  onText: (text: string) => void;
  // Chamado quando o atendente terminou de usar uma ferramenta (evento "tool").
  onTool: (tool: ToolUse) => void;
  // Mensagem amigável para mostrar na conversa. Chega no máximo uma vez.
  onError: (message: string) => void;
}

const CHAT_ENDPOINT = "/api/chat";

// Usada quando nem a rota consegue responder (sem internet, servidor fora do ar).
const NETWORK_ERROR_MESSAGE =
  "Não consegui falar com o atendimento. Confira sua conexão e tente de novo.";

// Envia o histórico e repassa cada evento aos handlers. Termina quando a resposta acaba;
// erros viram onError em vez de exceção, para a tela não precisar de try/catch.
export async function streamChatReply(
  history: ChatHistoryItem[],
  handlers: ChatStreamHandlers,
  signal: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history }),
      signal,
    });
  } catch {
    if (!signal.aborted) handlers.onError(NETWORK_ERROR_MESSAGE);
    return;
  }

  // Mesmo com status de erro (ex.: 400) o corpo traz um evento "error" com a explicação,
  // então ele é lido do mesmo jeito.
  if (!response.body) {
    handlers.onError(NETWORK_ERROR_MESSAGE);
    return;
  }

  let receivedAnything = false;
  let reportedError = false;
  const reportError = (message: string) => {
    if (reportedError) return;
    reportedError = true;
    handlers.onError(message);
  };

  try {
    for await (const event of readEvents(response.body)) {
      receivedAnything = true;
      if (event.type === "text") handlers.onText(event.text);
      else if (event.type === "tool") handlers.onTool(event.tool);
      else if (event.type === "error") reportError(event.message);
    }
  } catch {
    if (signal.aborted) return;
    reportError(NETWORK_ERROR_MESSAGE);
    return;
  }

  if (!receivedAnything && !response.ok) reportError(NETWORK_ERROR_MESSAGE);
}

// Só os eventos que a tela usa. tool_start, tool_end, done e qualquer tipo novo
// são ignorados sem quebrar a leitura.
type ChatEvent =
  | { type: "text"; text: string }
  | { type: "tool"; tool: ToolUse }
  | { type: "error"; message: string };

async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader();
  // stream: true junta letras acentuadas que chegam divididas entre dois pedaços.
  const decoder = new TextDecoder();
  // Guarda o pedaço de linha que ainda não terminou: um evento pode chegar partido ao meio.
  let pending = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });

      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) {
        const event = parseEventLine(line);
        if (event) yield event;
      }
    }
    // A última linha pode vir sem quebra de linha no final.
    pending += decoder.decode();
    const event = parseEventLine(pending);
    if (event) yield event;
  } finally {
    reader.releaseLock();
  }
}

function parseEventLine(line: string): ChatEvent | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;

  let data: unknown;
  try {
    data = JSON.parse(trimmed.slice("data:".length));
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;

  const record = data as Record<string, unknown>;
  if (record.type === "text" && typeof record.text === "string") {
    return { type: "text", text: record.text };
  }
  // Formato: {"type":"tool","nome":"consultar_usuario","ok":true}. "nome" vem em português
  // porque é assim que o site de chamados envia.
  if (record.type === "tool" && typeof record.nome === "string" && typeof record.ok === "boolean") {
    return { type: "tool", tool: { name: record.nome, ok: record.ok } };
  }
  if (record.type === "error" && typeof record.message === "string") {
    return { type: "error", message: record.message };
  }
  return null;
}

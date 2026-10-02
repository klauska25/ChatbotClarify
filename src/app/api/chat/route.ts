import type { NextRequest } from "next/server";
import { previewLastUserMessage, recordConnection } from "@/lib/bot-connections";
import { parseChatMessages, type ChatMessage } from "@/lib/chat-messages";
import { loadSystemPrompt } from "@/lib/system-prompt";

// Conversa com o bot. A inteligência fica no site de chamados (TIMETRACK_API_URL):
// esta rota valida o histórico, junta o system prompt e repassa a resposta em streaming.

export const dynamic = "force-dynamic";
// Respostas do bot chegam aos pedaços e podem demorar.
export const maxDuration = 60;

const BRAIN_PATH = "/api/cerebro";

// Tempo máximo para o site de chamados começar a responder. Depois que a resposta
// começa a chegar, o limite passa a ser o maxDuration acima.
const CONNECT_TIMEOUT_MS = 20_000;

// Mensagem usada no GET /api/chat?teste=1, que permite testar o bot direto no navegador.
const TEST_MESSAGE = "Não consigo logar";

const UNAVAILABLE_MESSAGE =
  "O atendimento está indisponível no momento. Tente novamente em alguns instantes.";

const INTERRUPTED_MESSAGE = "A resposta foi interrompida. Tente enviar a mensagem de novo.";

const EVENT_STREAM = "text/event-stream; charset=utf-8";
const PLAIN_TEXT = "text/plain; charset=utf-8";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }

  const parsed = parseChatMessages(body);
  if (!parsed.ok) {
    return errorResponse(parsed.message, EVENT_STREAM, 400);
  }
  return askBrain(parsed.messages, EVENT_STREAM, request.signal);
}

export async function GET(request: NextRequest): Promise<Response> {
  if (request.nextUrl.searchParams.get("teste") !== "1") {
    return errorResponse("Use POST para conversar com o bot.", PLAIN_TEXT, 405);
  }
  const messages: ChatMessage[] = [{ role: "user", content: TEST_MESSAGE }];
  return askBrain(messages, PLAIN_TEXT, request.signal);
}

// Envia o histórico ao site de chamados e devolve o corpo da resposta assim que ele
// começa a chegar, sem esperar terminar. Qualquer falha vira um evento de erro amigável.
async function askBrain(
  messages: ChatMessage[],
  contentType: string,
  clientSignal: AbortSignal,
): Promise<Response> {
  const baseUrl = process.env.TIMETRACK_API_URL?.trim();
  if (!baseUrl) {
    console.error("[api/chat] TIMETRACK_API_URL não está definida.");
    return errorResponse(UNAVAILABLE_MESSAGE, contentType);
  }

  const system = await loadSystemPrompt();
  const connectTimeout = new AbortController();
  const timer = setTimeout(() => connectTimeout.abort(), CONNECT_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(joinUrl(baseUrl, BRAIN_PATH), {
      method: "POST",
      headers: brainHeaders(),
      body: JSON.stringify({ messages, system }),
      // Se o navegador desistir, a chamada ao site de chamados também é cancelada.
      signal: AbortSignal.any([clientSignal, connectTimeout.signal]),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[api/chat] Falha ao falar com o site de chamados:", error);
    logConnection(502, messages);
    return errorResponse(UNAVAILABLE_MESSAGE, contentType);
  } finally {
    clearTimeout(timer);
  }

  logConnection(upstream.status, messages);

  if (!upstream.ok || !upstream.body) {
    console.error(`[api/chat] Site de chamados respondeu com status ${upstream.status}.`);
    // Lido e descartado só para liberar a conexão.
    await upstream.body?.cancel();
    return errorResponse(UNAVAILABLE_MESSAGE, contentType);
  }

  return new Response(relayStream(upstream.body), {
    headers: {
      "content-type": contentType,
      "cache-control": "no-cache, no-transform",
      // Evita que proxies juntem os pedaços antes de mandar ao navegador.
      "x-accel-buffering": "no",
    },
  });
}

// Repassa cada pedaço assim que chega. Se a conexão cair no meio, fecha com um evento
// de erro em vez de deixar o navegador com uma resposta cortada sem explicação.
function relayStream(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = source.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        console.error("[api/chat] Resposta do site de chamados interrompida:", error);
        // Começa com quebra de linha para não grudar num evento que ficou pela metade.
        controller.enqueue(new TextEncoder().encode("\n" + errorEvent(INTERRUPTED_MESSAGE)));
        controller.close();
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

function brainHeaders(): Headers {
  const headers = new Headers({
    "content-type": "application/json",
    accept: "text/event-stream",
  });
  // O painel do TimeTrack usa este cabeçalho para mostrar de quem é cada conversa.
  const studentName = process.env.ALUNO_NOME;
  if (studentName) headers.set("x-aluno", encodeURIComponent(studentName));
  return headers;
}

// Aceita a variável com ou sem barra no final.
function joinUrl(baseUrl: string, pathname: string): string {
  return baseUrl.replace(/\/+$/, "") + pathname;
}

function errorEvent(message: string): string {
  return `data: ${JSON.stringify({ type: "error", message })}\n\n`;
}

// Erros seguem o mesmo formato dos eventos do bot, para o chat mostrar a mensagem
// do jeito que mostra qualquer outra resposta.
function errorResponse(message: string, contentType: string, status = 200): Response {
  return new Response(errorEvent(message), {
    status,
    headers: { "content-type": contentType, "cache-control": "no-store" },
  });
}

// Registra a conversa na aba "Conexões do bot" do /painel.
function logConnection(status: number, messages: ChatMessage[]): void {
  recordConnection({
    time: new Date().toISOString(),
    path: BRAIN_PATH,
    status,
    lastUserMessage: previewLastUserMessage({ messages }),
  });
}

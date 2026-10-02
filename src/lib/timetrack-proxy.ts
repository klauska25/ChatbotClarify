import type { NextRequest } from "next/server";
import { previewLastUserMessage, recordConnection } from "@/lib/bot-connections";

// Para onde vão os endereços que este projeto não tem. Fica fixo de propósito:
// se viesse de TIMETRACK_API_URL e alguém apontasse a variável para este próprio
// projeto, a rota repassaria para si mesma sem parar.
const UPSTREAM_ORIGIN = "https://timetrack-curso.vercel.app";

// Cabeçalhos que descrevem a conexão com este servidor, e não o pedido em si.
// O fetch calcula os corretos para a nova conexão.
const SKIPPED_REQUEST_HEADERS = ["host", "connection", "content-length"];

// O fetch do servidor já descompacta a resposta, então o corpo que repassamos
// não está mais compactado e tem outro tamanho.
const SKIPPED_RESPONSE_HEADERS = ["content-encoding", "content-length"];

const METHODS_WITHOUT_BODY = ["GET", "HEAD"];

// Repassa o pedido ao TimeTrack do curso e devolve a resposta em streaming.
export async function forwardToTimeTrack(request: NextRequest): Promise<Response> {
  const { pathname, search } = request.nextUrl;
  const body = await readBody(request);

  let upstream: Response;
  try {
    upstream = await fetch(new URL(pathname + search, UPSTREAM_ORIGIN), {
      method: request.method,
      headers: copyHeaders(request.headers, SKIPPED_REQUEST_HEADERS),
      body,
      // Redirecionamentos voltam para o navegador como vieram, sem serem seguidos aqui.
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    logConnection(pathname, 502, body);
    return Response.json({ erro: "Não foi possível falar com o TimeTrack." }, { status: 502 });
  }

  logConnection(pathname, upstream.status, body);

  // upstream.body é repassado direto: cada pedaço segue para o navegador assim que chega,
  // o que mantém o streaming das respostas do bot.
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: copyHeaders(upstream.headers, SKIPPED_RESPONSE_HEADERS),
  });
}

// O corpo é lido inteiro porque precisamos olhar as mensagens para o registro.
// Pedidos ao bot são pequenos; só a resposta precisa de streaming.
async function readBody(request: NextRequest): Promise<ArrayBuffer | undefined> {
  if (METHODS_WITHOUT_BODY.includes(request.method)) return undefined;

  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

function copyHeaders(source: Headers, skipped: string[]): Headers {
  const headers = new Headers(source);
  for (const name of skipped) headers.delete(name);
  return headers;
}

function logConnection(path: string, status: number, body: ArrayBuffer | undefined): void {
  recordConnection({
    time: new Date().toISOString(),
    path,
    status,
    lastUserMessage: previewLastUserMessage(parseJson(body)),
  });
}

// Corpo que não é JSON (formulário, texto, vazio) simplesmente não entra no registro.
function parseJson(body: ArrayBuffer | undefined): unknown {
  if (!body) return undefined;
  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    return undefined;
  }
}

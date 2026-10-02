import type { NextRequest } from "next/server";
import { listConnections } from "@/lib/bot-connections";
import { forwardToTimeTrack } from "@/lib/timetrack-proxy";

// Porta de entrada do bot: todo endereço que este projeto não tem cai aqui e é
// repassado ao TimeTrack do curso, onde fica a inteligência do bot.
// Páginas e rotas próprias (/, /painel) têm prioridade sobre este coringa.

export const dynamic = "force-dynamic";
// Respostas do bot chegam aos pedaços e podem demorar.
export const maxDuration = 60;

// Endereço que lista os repasses em vez de repassar. Lido pela aba "Conexões do bot".
const CONNECTIONS_PATH = "/conexoes-do-bot";

export async function GET(request: NextRequest): Promise<Response> {
  if (request.nextUrl.pathname === CONNECTIONS_PATH) {
    return Response.json(listConnections(), { headers: { "cache-control": "no-store" } });
  }
  return forwardToTimeTrack(request);
}

export const POST = forwardToTimeTrack;
export const PUT = forwardToTimeTrack;
export const PATCH = forwardToTimeTrack;
export const DELETE = forwardToTimeTrack;

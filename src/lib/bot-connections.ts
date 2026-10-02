// Registro em memória dos repasses feitos ao TimeTrack do curso.
// Serve só para acompanhar no /painel se o bot está conversando; não é um log permanente.

// Quantos repasses guardar. Os mais antigos saem quando a lista enche.
const MAX_CONNECTIONS = 50;

// Tamanho máximo do trecho da mensagem do usuário que fica anotado.
const MESSAGE_PREVIEW_LENGTH = 80;

export interface BotConnection {
  time: string; // ISO 8601
  path: string;
  status: number;
  lastUserMessage?: string;
}

// Mais antigo primeiro. Fica no módulo, então vale enquanto a instância do servidor
// estiver de pé: na Vercel ela pode reiniciar e a lista recomeça vazia.
const connections: BotConnection[] = [];

// Nunca recebe cabeçalhos: só o que é seguro mostrar no painel.
export function recordConnection(connection: BotConnection): void {
  connections.push(connection);
  if (connections.length > MAX_CONNECTIONS) {
    connections.splice(0, connections.length - MAX_CONNECTIONS);
  }
}

export function listConnections(): BotConnection[] {
  return [...connections];
}

// Procura, num corpo JSON no formato { messages: [...] }, o texto da última
// mensagem do usuário e devolve os primeiros caracteres. Qualquer outro corpo dá undefined.
export function previewLastUserMessage(body: unknown): string | undefined {
  if (!isRecord(body) || !Array.isArray(body.messages)) return undefined;

  // De trás para frente, porque a mensagem mais recente é a que interessa.
  for (let index = body.messages.length - 1; index >= 0; index--) {
    const message: unknown = body.messages[index];
    if (!isRecord(message) || message.role !== "user") continue;

    const text = extractText(message.content).trim();
    // Mensagens só com tool_result (loop de tool use) não têm texto: segue procurando.
    if (text) return text.slice(0, MESSAGE_PREVIEW_LENGTH);
  }

  return undefined;
}

// O conteúdo pode ser uma string ou uma lista de blocos, como na Claude API.
function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((block: unknown) =>
      isRecord(block) && block.type === "text" && typeof block.text === "string" ? block.text : "",
    )
    .filter(Boolean)
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

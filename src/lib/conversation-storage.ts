// Guarda as conversas no localStorage do navegador, para elas (e os selos das
// ferramentas em cada mensagem) continuarem lá depois de recarregar a página.
// O que vem do localStorage pode ter sido salvo por uma versão antiga do site ou
// editado à mão, então tudo é validado antes de entrar na tela.

import { CATEGORY_STYLES } from "./categories";
import type { Category, Conversation, Message, ToolUse } from "./types";

const STORAGE_KEY = "timetrack-conversations";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && Object.hasOwn(CATEGORY_STYLES, value);
}

function parseToolUse(value: unknown): ToolUse | null {
  if (!isRecord(value)) return null;
  if (typeof value.name !== "string" || typeof value.ok !== "boolean") return null;
  return { name: value.name, ok: value.ok };
}

function parseMessage(value: unknown): Message | null {
  if (!isRecord(value)) return null;
  const { id, role, text, sentAt, tools } = value;
  if (typeof id !== "string" || typeof text !== "string" || typeof sentAt !== "number") return null;
  if (role !== "user" && role !== "assistant") return null;

  const message: Message = { id, role, text, sentAt };
  if (Array.isArray(tools)) {
    const parsedTools = tools.map(parseToolUse).filter((tool) => tool !== null);
    if (parsedTools.length > 0) message.tools = parsedTools;
  }
  return message;
}

function parseConversation(value: unknown): Conversation | null {
  if (!isRecord(value)) return null;
  const { id, title, contactName, contactEmail, category, createdAt, messages } = value;
  if (typeof id !== "string" || typeof title !== "string" || typeof contactName !== "string") {
    return null;
  }
  if (typeof createdAt !== "number" || !Array.isArray(messages)) return null;

  const conversation: Conversation = {
    id,
    title,
    contactName,
    createdAt,
    messages: messages.map(parseMessage).filter((message) => message !== null),
  };
  if (typeof contactEmail === "string") conversation.contactEmail = contactEmail;
  if (isCategory(category)) conversation.category = category;
  return conversation;
}

// Devolve null quando não há nada salvo (ou não dá para ler); aí a tela usa as conversas padrão.
export function loadConversations(): Conversation[] | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return null;
    const data: unknown = JSON.parse(saved);
    if (!Array.isArray(data)) return null;
    const conversations = data.map(parseConversation).filter((item) => item !== null);
    return conversations.length > 0 ? conversations : null;
  } catch {
    return null;
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Sem acesso ao localStorage (aba anônima, cota cheia): as conversas valem só nesta visita.
  }
}

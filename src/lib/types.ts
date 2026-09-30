// Categorias aceitas pelo TimeTrack ao abrir chamados (ver docs/timetrack-api.md, seção 3).
export type Category =
  | "acesso"
  | "dados"
  | "integracao"
  | "duvida"
  | "bug"
  | "feature";

// "user" é a pessoa atendida; "assistant" é o atendente (o chatbot).
export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  sentAt: number; // timestamp em milissegundos
}

export interface Conversation {
  id: string;
  title: string;
  contactName: string;
  contactEmail?: string;
  // Conversas novas ainda não têm categoria; ela será definida pela IA.
  category?: Category;
  createdAt: number;
  messages: Message[];
}

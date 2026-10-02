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
  // Só nas respostas do atendente que usaram ferramentas. Fica salvo junto com a mensagem.
  tools?: ToolUse[];
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

// Ferramenta que o atendente usou ao montar uma resposta (evento "tool" do /api/chat).
// name é o nome técnico da tool (ex.: "consultar_usuario"); o texto da tela sai de tool-labels.ts.
export interface ToolUse {
  name: string;
  ok: boolean;
}

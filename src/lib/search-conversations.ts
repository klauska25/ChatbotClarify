import { CATEGORY_STYLES } from "./categories";
import type { Conversation } from "./types";

// Deixa o texto em minúsculas e sem acentos, para "joão" achar "Joao" e vice-versa.
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Filtra conversas pelo nome, email, título, categoria ou texto de qualquer mensagem.
export function searchConversations(
  conversations: Conversation[],
  query: string,
): Conversation[] {
  const term = normalize(query);
  if (!term) return conversations;

  return conversations.filter((conversation) => {
    const fields = [
      conversation.contactName,
      conversation.contactEmail ?? "",
      conversation.title,
      conversation.category ? CATEGORY_STYLES[conversation.category].label : "",
      ...conversation.messages.map((message) => message.text),
    ];
    return fields.some((field) => normalize(field).includes(term));
  });
}

import { formatRelativeTime } from "@/lib/relative-time";
import type { Conversation } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  now: number | null;
  onSelect: (conversationId: string) => void;
}

export function ConversationListItem({
  conversation,
  isActive,
  now,
  onSelect,
}: ConversationListItemProps) {
  const lastMessage = conversation.messages.at(-1);
  const lastActivity = lastMessage?.sentAt ?? conversation.createdAt;

  let preview = "Nenhuma mensagem ainda";
  if (lastMessage) {
    preview =
      lastMessage.role === "assistant"
        ? `Atendente: ${lastMessage.text}`
        : lastMessage.text;
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-current={isActive ? "true" : undefined}
        className={`relative w-full rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
          isActive ? "bg-white/10" : "hover:bg-white/5"
        }`}
      >
        {isActive && (
          <span
            className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-brand"
            aria-hidden="true"
          />
        )}

        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm font-medium text-white">
            {conversation.contactName}
          </span>
          {/* O tempo só aparece no navegador; ver useNow. */}
          <span className="shrink-0 text-xs text-neutral-500">
            {now !== null ? formatRelativeTime(lastActivity, now) : ""}
          </span>
        </div>

        <p className="mt-0.5 truncate text-sm text-neutral-400">{preview}</p>

        {conversation.category && (
          <div className="mt-2">
            <CategoryBadge category={conversation.category} tone="dark" />
          </div>
        )}
      </button>
    </li>
  );
}

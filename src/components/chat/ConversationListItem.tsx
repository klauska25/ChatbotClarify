import { formatRelativeTime } from "@/lib/time-format";
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
  const preview = lastMessage?.text ?? "Conversa sem mensagens";

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        aria-current={isActive ? "true" : undefined}
        className={`w-full rounded-lg border px-3 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent-line ${
          isActive
            ? "border-line-strong bg-selected"
            : "border-transparent hover:bg-hover"
        }`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-sm font-bold text-fg">
            {conversation.contactName}
          </span>
          {/* O tempo só aparece no navegador; ver useNow. */}
          <span className="shrink-0 font-mono text-xs text-muted">
            {now !== null ? formatRelativeTime(lastActivity, now) : ""}
          </span>
        </div>

        <p className="mt-1 truncate text-sm text-muted">{preview}</p>

        {conversation.category && (
          <div className="mt-2.5">
            <CategoryBadge category={conversation.category} />
          </div>
        )}
      </button>
    </li>
  );
}

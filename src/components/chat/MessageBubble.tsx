import { formatClockTime } from "@/lib/time-format";
import type { Message } from "@/lib/types";

const ASSISTANT_NAME = "Atendente";

interface MessageBubbleProps {
  message: Message;
  contactName: string;
  // Falso durante a renderização no servidor, para não mostrar a hora no fuso errado.
  showTime: boolean;
}

export function MessageBubble({ message, contactName, showTime }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const author = isUser ? contactName : ASSISTANT_NAME;

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap md:max-w-[70%] ${
          isUser
            ? "bg-brand text-ink"
            : "border border-line bg-raised text-neutral-100"
        }`}
      >
        {message.text}
      </div>
      <p className="mt-1.5 px-1 font-mono text-[11px] text-neutral-400">
        {author}
        {showTime && ` · ${formatClockTime(message.sentAt)}`}
      </p>
    </div>
  );
}

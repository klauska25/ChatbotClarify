import { formatClockTime } from "@/lib/time-format";
import type { Message } from "@/lib/types";
import { SpeakButton } from "./SpeakButton";
import { ToolBadge } from "./ToolBadge";

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
  const tools = message.tools ?? [];

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      {tools.length > 0 && (
        <div className="mb-2 flex max-w-[85%] flex-wrap gap-1.5 md:max-w-[70%]">
          {tools.map((tool, index) => (
            <ToolBadge key={index} tool={tool} />
          ))}
        </div>
      )}
      {/* Enquanto só as ferramentas chegaram, a bolha de texto ainda não aparece. */}
      {message.text !== "" && (
        <div
          className={`max-w-[85%] rounded-[22px] px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap md:max-w-[70%] ${
            isUser ? "glow-brand bg-brand text-ink" : "glass-soft text-fg"
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="mt-1.5 flex items-center gap-2 px-1 font-mono text-[11px] text-muted">
        <p>
          {author}
          {showTime && ` · ${formatClockTime(message.sentAt)}`}
        </p>
        {!isUser && message.text !== "" && <SpeakButton text={message.text} />}
      </div>
    </div>
  );
}

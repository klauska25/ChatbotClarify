import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed md:max-w-[70%] ${
          isUser
            ? "rounded-br-md bg-brand text-ink"
            : "rounded-bl-md bg-neutral-100 text-neutral-900"
        }`}
      >
        <span className="sr-only">{isUser ? "Você disse: " : "Atendente disse: "}</span>
        {message.text}
      </div>
    </div>
  );
}

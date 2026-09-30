"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: Message[];
  isReplying: boolean;
}

export function MessageList({ messages, isReplying }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mantém a mensagem mais recente visível sempre que algo novo aparece.
  useEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length, isReplying]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto" role="log">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6 md:px-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isReplying && <TypingIndicator />}
      </div>
    </div>
  );
}

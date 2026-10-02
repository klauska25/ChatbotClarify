"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: Message[];
  contactName: string;
  isReplying: boolean;
  showTime: boolean;
}

export function MessageList({ messages, contactName, isReplying, showTime }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Acompanha a resposta enquanto ela cresce aos pedaços, não só quando chega mensagem nova.
  const lastMessageText = messages.at(-1)?.text;

  // Mantém a mensagem mais recente visível sempre que algo novo aparece.
  useEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length, lastMessageText, isReplying]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto" role="log">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 md:px-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            contactName={contactName}
            showTime={showTime}
          />
        ))}
        {isReplying && <TypingIndicator />}
      </div>
    </div>
  );
}

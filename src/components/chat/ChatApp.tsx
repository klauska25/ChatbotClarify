"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNow } from "@/hooks/use-now";
import { sampleConversations } from "@/lib/conversas-exemplo";
import { createId } from "@/lib/ids";
import type { Conversation, Message } from "@/lib/types";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Sidebar } from "./Sidebar";

// Resposta fixa enquanto o chatbot ainda não está ligado à IA.
const PLACEHOLDER_REPLY =
  "Ainda estou aprendendo a responder. No Dia 4 eu ganho um cérebro!";
const REPLY_DELAY_MS = 500;

const NEW_CONVERSATION_TITLE = "Nova conversa";
const NEW_CONVERSATION_CONTACT = "Visitante";
const TITLE_MAX_LENGTH = 48;

function getLastActivity(conversation: Conversation): number {
  return conversation.messages.at(-1)?.sentAt ?? conversation.createdAt;
}

// Usa o começo da primeira mensagem como título de uma conversa nova.
function titleFromText(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= TITLE_MAX_LENGTH) return singleLine;
  return `${singleLine.slice(0, TITLE_MAX_LENGTH).trimEnd()}...`;
}

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [activeId, setActiveId] = useState<string>(sampleConversations[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Conversas que estão esperando a resposta do atendente.
  const [replyingIds, setReplyingIds] = useState<ReadonlySet<string>>(new Set());
  const replyTimers = useRef<number[]>([]);
  const now = useNow();

  // Cancela respostas agendadas se o componente sair da tela.
  useEffect(() => {
    const timers = replyTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // Esc fecha a gaveta no celular.
  useEffect(() => {
    if (!isSidebarOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsSidebarOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => getLastActivity(b) - getLastActivity(a)),
    [conversations],
  );

  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? conversations[0];
  const isReplying = replyingIds.has(activeConversation.id);

  function appendMessage(conversationId: string, message: Message) {
    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        const isFirstUserMessage =
          conversation.messages.length === 0 && message.role === "user";
        return {
          ...conversation,
          title: isFirstUserMessage ? titleFromText(message.text) : conversation.title,
          messages: [...conversation.messages, message],
        };
      }),
    );
  }

  function setReplying(conversationId: string, replying: boolean) {
    setReplyingIds((previous) => {
      const next = new Set(previous);
      if (replying) next.add(conversationId);
      else next.delete(conversationId);
      return next;
    });
  }

  function sendMessage(text: string) {
    const conversationId = activeConversation.id;

    appendMessage(conversationId, {
      id: createId("msg"),
      role: "user",
      text,
      sentAt: Date.now(),
    });
    setReplying(conversationId, true);

    const timer = window.setTimeout(() => {
      appendMessage(conversationId, {
        id: createId("msg"),
        role: "assistant",
        text: PLACEHOLDER_REPLY,
        sentAt: Date.now(),
      });
      setReplying(conversationId, false);
      replyTimers.current = replyTimers.current.filter((id) => id !== timer);
    }, REPLY_DELAY_MS);
    replyTimers.current.push(timer);
  }

  function selectConversation(conversationId: string) {
    setActiveId(conversationId);
    setIsSidebarOpen(false);
  }

  function startNewConversation() {
    // Se já existe uma conversa vazia, reaproveita em vez de criar outra.
    const emptyConversation = conversations.find(
      (conversation) => conversation.messages.length === 0,
    );
    if (emptyConversation) {
      selectConversation(emptyConversation.id);
      return;
    }

    const conversation: Conversation = {
      id: createId("conv"),
      title: NEW_CONVERSATION_TITLE,
      contactName: NEW_CONVERSATION_CONTACT,
      createdAt: Date.now(),
      messages: [],
    };
    setConversations((previous) => [conversation, ...previous]);
    selectConversation(conversation.id);
  }

  const showEmptyState = activeConversation.messages.length === 0 && !isReplying;

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      <Sidebar
        conversations={sortedConversations}
        activeConversationId={activeConversation.id}
        now={now}
        isOpen={isSidebarOpen}
        onSelect={selectConversation}
        onNewConversation={startNewConversation}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={activeConversation.title}
          category={activeConversation.category}
          isMenuOpen={isSidebarOpen}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        {showEmptyState ? (
          <EmptyState onPickSuggestion={sendMessage} />
        ) : (
          // key força remontar ao trocar de conversa, para rolar até o fim.
          <MessageList
            key={activeConversation.id}
            messages={activeConversation.messages}
            contactName={activeConversation.contactName}
            isReplying={isReplying}
            showTime={now !== null}
          />
        )}

        <MessageInput onSend={sendMessage} />
      </main>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNow } from "@/hooks/use-now";
import { streamChatReply } from "@/lib/chat-stream";
import { sampleConversations } from "@/lib/conversas-exemplo";
import { loadConversations, saveConversations } from "@/lib/conversation-storage";
import { findEmail, nameFromEmail } from "@/lib/contact-from-email";
import { createId } from "@/lib/ids";
import type { Conversation, Message, ToolUse } from "@/lib/types";
import { AmbientGlow } from "./AmbientGlow";
import { ChatHeader } from "./ChatHeader";
import { EmptyState } from "./EmptyState";
import { LiveTopography } from "./LiveTopography";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { Sidebar } from "./Sidebar";

const NEW_CONVERSATION_TITLE = "Nova conversa";
const NEW_CONVERSATION_CONTACT = "Visitante";
const TITLE_MAX_LENGTH = 48;

// O chat abre numa conversa nova. O id é fixo (e não aleatório) para o servidor e o
// navegador escolherem o mesmo desenho de fundo e o HTML bater nos dois.
const INITIAL_CONVERSATION_ID = "initial-conversation";

function createEmptyConversation(id: string): Conversation {
  return {
    id,
    title: NEW_CONVERSATION_TITLE,
    contactName: NEW_CONVERSATION_CONTACT,
    createdAt: Date.now(),
    messages: [],
  };
}

function getLastActivity(conversation: Conversation): number {
  return conversation.messages.at(-1)?.sentAt ?? conversation.createdAt;
}

// Usa o começo da primeira mensagem como título de uma conversa nova.
function titleFromText(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= TITLE_MAX_LENGTH) return singleLine;
  return `${singleLine.slice(0, TITLE_MAX_LENGTH).trimEnd()}...`;
}

// Quando a pessoa informa o e-mail pela primeira vez, a conversa passa a ter o nome dela.
// Só vale para o primeiro e-mail: se ela citar o e-mail de um colega depois, o nome não muda.
function contactFromMessage(
  conversation: Conversation,
  message: Message,
): Pick<Conversation, "contactName" | "contactEmail"> | null {
  if (message.role !== "user" || conversation.contactEmail) return null;
  const email = findEmail(message.text);
  if (!email) return null;
  return { contactEmail: email, contactName: nameFromEmail(email) };
}

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    createEmptyConversation(INITIAL_CONVERSATION_ID),
    ...sampleConversations,
  ]);
  const [activeId, setActiveId] = useState<string>(INITIAL_CONVERSATION_ID);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Conversas que estão esperando a resposta do atendente.
  const [replyingIds, setReplyingIds] = useState<ReadonlySet<string>>(new Set());
  // Respostas em andamento, para cancelar os pedidos se o componente sair da tela.
  const pendingReplies = useRef<Set<AbortController>>(new Set());
  // Só depois de ler o localStorage é que as mudanças passam a ser salvas, senão as
  // conversas padrão sobrescreveriam as salvas logo na abertura da página.
  const [hasLoadedSaved, setHasLoadedSaved] = useState(false);
  const now = useNow();

  // O localStorage só existe no navegador, por isso é lido depois da primeira renderização.
  useEffect(() => {
    const saved = loadConversations();
    if (saved) setConversations(saved);
    setHasLoadedSaved(true);
  }, []);

  useEffect(() => {
    if (hasLoadedSaved) saveConversations(conversations);
  }, [conversations, hasLoadedSaved]);

  useEffect(() => {
    const replies = pendingReplies.current;
    return () => replies.forEach((controller) => controller.abort());
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
          ...contactFromMessage(conversation, message),
          title: isFirstUserMessage ? titleFromText(message.text) : conversation.title,
          messages: [...conversation.messages, message],
        };
      }),
    );
  }

  // Acrescenta um pedaço ao texto de uma mensagem que já está na tela (resposta em streaming).
  function appendToMessage(conversationId: string, messageId: string, text: string) {
    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        return {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, text: message.text + text } : message,
          ),
        };
      }),
    );
  }

  // Registra uma ferramenta usada pelo atendente na mensagem de resposta.
  function addToolToMessage(conversationId: string, messageId: string, tool: ToolUse) {
    setConversations((previous) =>
      previous.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        return {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId
              ? { ...message, tools: [...(message.tools ?? []), tool] }
              : message,
          ),
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

  async function sendMessage(text: string) {
    const conversationId = activeConversation.id;
    if (replyingIds.has(conversationId)) return;

    const userMessage: Message = { id: createId("msg"), role: "user", text, sentAt: Date.now() };
    // O histórico é montado aqui porque o estado só é atualizado depois deste render.
    // Respostas só com selos (sem texto) ficam de fora: a API não aceita mensagem vazia.
    const history = [...activeConversation.messages, userMessage]
      .filter((message) => message.text !== "")
      .map((message) => ({ role: message.role, content: message.text }));

    appendMessage(conversationId, userMessage);
    setReplying(conversationId, true);

    const controller = new AbortController();
    pendingReplies.current.add(controller);
    // A mensagem do atendente nasce com o primeiro evento (texto ou ferramenta). Se a
    // primeira coisa for uma ferramenta, o selo aparece sozinho e o indicador de
    // digitando continua até o texto chegar.
    let replyId: string | null = null;
    let replyHasText = false;

    function ensureReply(): string {
      if (replyId === null) {
        replyId = createId("msg");
        appendMessage(conversationId, {
          id: replyId,
          role: "assistant",
          text: "",
          sentAt: Date.now(),
        });
      }
      return replyId;
    }

    function addToReply(chunk: string) {
      appendToMessage(conversationId, ensureReply(), chunk);
      replyHasText = true;
      setReplying(conversationId, false);
    }

    function addToolToReply(tool: ToolUse) {
      addToolToMessage(conversationId, ensureReply(), tool);
    }

    await streamChatReply(
      history,
      {
        onText: addToReply,
        onTool: addToolToReply,
        // Se a resposta já começou, o aviso vai no fim dela em vez de numa bolha nova.
        onError: (message) => addToReply(replyHasText ? `\n\n${message}` : message),
      },
      controller.signal,
    );

    pendingReplies.current.delete(controller);
    setReplying(conversationId, false);
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

    const conversation = createEmptyConversation(createId("conv"));
    setConversations((previous) => [conversation, ...previous]);
    selectConversation(conversation.id);
  }

  const showEmptyState = activeConversation.messages.length === 0 && !isReplying;

  return (
    // isolate cria uma camada própria: o fundo (-z-10) fica atrás dos painéis de vidro,
    // mas na frente da cor de fundo da página.
    <div className="relative isolate flex h-dvh overflow-hidden bg-surface md:gap-3 md:p-3">
      <AmbientGlow />
      {/* Na conversa vazia as linhas ondulam devagar; com mensagens, ficam paradas. */}
      <LiveTopography
        conversationId={activeConversation.id}
        isMoving={activeConversation.messages.length === 0}
      />

      <Sidebar
        conversations={sortedConversations}
        activeConversationId={activeConversation.id}
        now={now}
        isOpen={isSidebarOpen}
        onSelect={selectConversation}
        onNewConversation={startNewConversation}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col gap-2 p-2 md:gap-3 md:p-0">
        <ChatHeader
          title={activeConversation.title}
          category={activeConversation.category}
          isMenuOpen={isSidebarOpen}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <div className="flex min-h-0 flex-1 flex-col">
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
        </div>

        <MessageInput onSend={sendMessage} isSendBlocked={isReplying} />
      </main>
    </div>
  );
}

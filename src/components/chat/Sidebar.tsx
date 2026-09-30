"use client";

import { useMemo, useState } from "react";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { searchConversations } from "@/lib/search-conversations";
import type { Conversation } from "@/lib/types";
import { AccountFooter } from "./AccountFooter";
import { ConversationListItem } from "./ConversationListItem";
import { SearchField } from "./SearchField";

export const SIDEBAR_ID = "conversation-sidebar";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  now: number | null;
  // Só tem efeito no celular, onde a lista vira uma gaveta.
  isOpen: boolean;
  onSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  now,
  isOpen,
  onSelect,
  onNewConversation,
  onClose,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const visibleConversations = useMemo(
    () => searchConversations(conversations, query),
    [conversations, query],
  );

  return (
    <>
      {/* Fundo escurecido atrás da gaveta no celular; tocar nele fecha a gaveta. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Painel de vidro. No celular é uma gaveta mais opaca, para o texto continuar legível.
          "invisible" tira a gaveta fechada da navegação por teclado. */}
      <aside
        id={SIDEBAR_ID}
        aria-label="Conversas"
        className={`glass fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col rounded-r-3xl transition-[transform,visibility] duration-300 ease-out max-md:[background:var(--glass-strong)] md:visible md:static md:w-[300px] md:translate-x-0 md:rounded-3xl ${
          isOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-6">
          <p className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl font-bold tracking-tight text-fg">
              TimeTrack
            </span>
            <span className="text-[11px] font-medium tracking-[0.2em] text-muted uppercase">
              Suporte
            </span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-hover hover:text-fg md:hidden"
            aria-label="Fechar lista de conversas"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-3.5 px-4 pt-6 pb-2">
          <button
            type="button"
            onClick={onNewConversation}
            className="neu-raised flex w-full items-center justify-center gap-2.5 rounded-full bg-neu px-4 py-3 text-sm font-bold text-fg transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:neu-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-line"
          >
            <span className="glow-brand grid size-6 place-items-center rounded-full bg-brand text-ink">
              <PlusIcon className="size-3.5" />
            </span>
            Nova conversa
          </button>

          <SearchField value={query} onChange={setQuery} />
        </div>

        <h2 className="px-5 pt-5 pb-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          Conversas
        </h2>

        {visibleConversations.length === 0 && (
          <p className="px-5 pt-1 text-sm text-muted">Nenhum atendimento encontrado.</p>
        )}

        <ul className="flex-1 space-y-1.5 overflow-y-auto px-3 pt-1 pb-3">
          {visibleConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              now={now}
              onSelect={onSelect}
            />
          ))}
        </ul>

        <AccountFooter />
      </aside>
    </>
  );
}

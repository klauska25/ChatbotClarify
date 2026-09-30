import { CloseIcon, PlusIcon } from "@/components/icons";
import type { Conversation } from "@/lib/types";
import { ConversationListItem } from "./ConversationListItem";

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
  return (
    <>
      {/* Fundo escurecido atrás da gaveta no celular; tocar nele fecha a gaveta. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* "invisible" tira a gaveta fechada da navegação por teclado no celular. */}
      <aside
        id={SIDEBAR_ID}
        aria-label="Conversas"
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col border-r border-line bg-panel transition-[transform,visibility] duration-200 ease-out md:visible md:static md:w-[310px] md:translate-x-0 ${
          isOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="flex items-baseline gap-2.5">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              TimeTrack
            </span>
            <span className="text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
              Suporte
            </span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Fechar lista de conversas"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-line px-4 pt-5 pb-4">
          <button
            type="button"
            onClick={onNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <PlusIcon />
            Nova conversa
          </button>
        </div>

        <h2 className="px-5 pt-5 pb-3 font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase">
          Conversas
        </h2>

        <ul className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {conversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              now={now}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </aside>
    </>
  );
}

import { ClockIcon, CloseIcon, PlusIcon } from "@/components/icons";
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
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* "invisible" tira a gaveta fechada da navegação por teclado no celular. */}
      <aside
        id={SIDEBAR_ID}
        aria-label="Conversas"
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col bg-ink text-white transition-[transform,visibility] duration-200 ease-out md:visible md:static md:translate-x-0 ${
          isOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-brand text-ink">
              <ClockIcon className="size-[18px]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              TimeTrack <span className="font-normal text-neutral-400">Suporte</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Fechar lista de conversas"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-4 pt-5 pb-4">
          <button
            type="button"
            onClick={onNewConversation}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <PlusIcon />
            Nova conversa
          </button>
        </div>

        <h2 className="px-5 pb-2 text-xs font-medium text-neutral-500">Conversas</h2>

        <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
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

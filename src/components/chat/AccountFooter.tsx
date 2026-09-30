import { SettingsIcon } from "@/components/icons";
import { CURRENT_USER, getInitials } from "@/lib/current-user";

// Rodapé da lista de conversas com a conta de quem está usando o chat.
export function AccountFooter() {
  return (
    <div className="neu-raised m-3 flex shrink-0 items-center gap-3 rounded-2xl bg-neu px-3.5 py-3">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full border border-accent-line/40 bg-brand/15 font-display text-sm font-semibold text-brand-dark shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] dark:text-brand"
        aria-hidden="true"
      >
        {getInitials(CURRENT_USER.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-fg">{CURRENT_USER.name}</p>
        <p className="font-mono text-xs text-muted">Minha conta</p>
      </div>

      {/* Ainda não há tela de configurações; o botão fica pronto para ela. */}
      <button
        type="button"
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent-line"
        aria-label="Configurações da conta"
        title="Configurações da conta"
      >
        <SettingsIcon />
      </button>
    </div>
  );
}

import { MenuIcon } from "@/components/icons";
import type { Category } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { SIDEBAR_ID } from "./Sidebar";

interface ChatHeaderProps {
  title: string;
  contactName: string;
  contactEmail?: string;
  category?: Category;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
}

export function ChatHeader({
  title,
  contactName,
  contactEmail,
  category,
  isMenuOpen,
  onOpenMenu,
}: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        className="-ml-1.5 rounded-md p-1.5 text-neutral-700 hover:bg-neutral-100 md:hidden"
        aria-label="Abrir lista de conversas"
        aria-controls={SIDEBAR_ID}
        aria-expanded={isMenuOpen}
      >
        <MenuIcon />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold text-ink">{title}</h1>
        {contactEmail && (
          <p className="truncate text-xs text-neutral-500">
            {contactName} · {contactEmail}
          </p>
        )}
      </div>

      {category && <CategoryBadge category={category} />}
    </header>
  );
}

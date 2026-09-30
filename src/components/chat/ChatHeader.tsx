import { MenuIcon } from "@/components/icons";
import type { Category } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { SIDEBAR_ID } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";

interface ChatHeaderProps {
  title: string;
  category?: Category;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
}

export function ChatHeader({ title, category, isMenuOpen, onOpenMenu }: ChatHeaderProps) {
  return (
    <header className="glass flex h-14 shrink-0 items-center gap-3 rounded-2xl px-4 md:h-16 md:rounded-3xl md:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        className="-ml-1.5 rounded-full p-1.5 text-muted hover:bg-hover hover:text-fg md:hidden"
        aria-label="Abrir lista de conversas"
        aria-controls={SIDEBAR_ID}
        aria-expanded={isMenuOpen}
      >
        <MenuIcon />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="truncate font-display text-lg font-medium text-fg">{title}</h1>
        {category && <CategoryBadge category={category} />}
      </div>

      <ThemeToggle />
    </header>
  );
}

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
    <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line bg-panel px-4 md:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        className="-ml-1.5 rounded-md p-1.5 text-muted hover:bg-hover hover:text-fg md:hidden"
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

"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "light" ? "Ativar tema escuro" : "Ativar tema claro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent-line"
      aria-label={label}
      title={label}
    >
      {/* O ícone só aparece depois de sabermos o tema atual (ver useTheme). */}
      {theme === "light" && <MoonIcon className="size-[18px]" />}
      {theme === "dark" && <SunIcon className="size-[18px]" />}
    </button>
  );
}

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
      className="neu-raised grid size-9 shrink-0 place-items-center rounded-full bg-neu text-muted transition-colors hover:text-fg active:neu-inset focus-visible:outline-2 focus-visible:outline-accent-line"
      aria-label={label}
      title={label}
    >
      {/* O ícone só aparece depois de sabermos o tema atual (ver useTheme). */}
      {theme === "light" && <MoonIcon className="size-[18px]" />}
      {theme === "dark" && <SunIcon className="size-[18px]" />}
    </button>
  );
}

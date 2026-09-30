"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

// Lê e troca o tema da página. Começa como null porque no servidor
// não sabemos qual tema o navegador escolheu (ver THEME_INIT_SCRIPT).
export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Sem acesso ao localStorage (aba anônima, por exemplo): o tema vale só nesta visita.
    }
  }

  return { theme, toggleTheme };
}

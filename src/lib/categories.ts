import type { Category } from "./types";

interface CategoryStyle {
  label: string;
  className: string;
}

// Cada etiqueta tem uma versão para o tema claro e outra para o escuro (dark:).
export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  acesso: {
    label: "Acesso",
    className: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300",
  },
  dados: {
    label: "Dados",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300",
  },
  integracao: {
    label: "Integração",
    className: "bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300",
  },
  duvida: {
    label: "Dúvida",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300",
  },
  bug: {
    label: "Bug",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300",
  },
  feature: {
    label: "Feature",
    className: "bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300",
  },
};

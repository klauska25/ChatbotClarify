import type { Category } from "./types";

interface CategoryStyle {
  label: string;
  // Classes para etiquetas sobre fundo claro (área da conversa).
  light: string;
  // Classes para etiquetas sobre fundo escuro (lista de conversas).
  dark: string;
}

export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  acesso: {
    label: "Acesso",
    light: "bg-amber-100 text-amber-900",
    dark: "bg-amber-400/15 text-amber-300",
  },
  dados: {
    label: "Dados",
    light: "bg-sky-100 text-sky-900",
    dark: "bg-sky-400/15 text-sky-300",
  },
  integracao: {
    label: "Integração",
    light: "bg-indigo-100 text-indigo-900",
    dark: "bg-indigo-400/15 text-indigo-300",
  },
  duvida: {
    label: "Dúvida",
    light: "bg-neutral-200 text-neutral-800",
    dark: "bg-neutral-400/15 text-neutral-300",
  },
  bug: {
    label: "Bug",
    light: "bg-red-100 text-red-900",
    dark: "bg-red-400/15 text-red-300",
  },
  feature: {
    label: "Feature",
    light: "bg-teal-100 text-teal-900",
    dark: "bg-teal-400/15 text-teal-300",
  },
};

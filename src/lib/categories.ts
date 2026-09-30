import type { Category } from "./types";

interface CategoryStyle {
  label: string;
  className: string;
}

export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  acesso: { label: "Acesso", className: "bg-red-950/80 text-red-300" },
  dados: { label: "Dados", className: "bg-blue-950/80 text-blue-300" },
  integracao: { label: "Integração", className: "bg-violet-950/80 text-violet-300" },
  duvida: { label: "Dúvida", className: "bg-emerald-950/80 text-emerald-300" },
  bug: { label: "Bug", className: "bg-orange-950/80 text-orange-300" },
  feature: { label: "Feature", className: "bg-pink-950/80 text-pink-300" },
};

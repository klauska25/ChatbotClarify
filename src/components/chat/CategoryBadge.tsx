import { CATEGORY_STYLES } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface CategoryBadgeProps {
  category: Category;
  // "dark" para quando a etiqueta fica sobre o fundo preto da lista.
  tone?: "light" | "dark";
}

export function CategoryBadge({ category, tone = "light" }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${style[tone]}`}
    >
      {style.label}
    </span>
  );
}

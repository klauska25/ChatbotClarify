import { CATEGORY_STYLES } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category];

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-0.5 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

import { Category } from "@prisma/client";
import { CATEGORY_LABELS } from "@/lib/constants";

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="section-label inline-block border border-accent px-2 py-0.5">
      {CATEGORY_LABELS[category]}
    </span>
  );
}

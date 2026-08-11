import { Category } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const categoryConfig: Record<Category, { label: string; colorClass: string }> = {
  publication: { label: "Publication", colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  treatise: { label: "Treatise", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  software: { label: "Software", colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  patent: { label: "Patent", colorClass: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  music: { label: "Music", colorClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  other: { label: "Other", colorClass: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800" },
};

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  const config = categoryConfig[category] || categoryConfig.other;
  
  return (
    <span className={cn("px-2.5 py-0.5 text-xs font-mono font-medium border uppercase tracking-wider", config.colorClass, className)}>
      {config.label}
    </span>
  );
}

export function getCategoryLabel(category: Category) {
  return categoryConfig[category]?.label || "Other";
}

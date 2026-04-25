import { Package, Sparkles, Tag } from "lucide-react";
import { CONDITION_LABEL, CATEGORY_LABEL } from "@/lib/postLabels";

interface PostStatsProps {
  quantity: number;
  condition: string;
  category: string;
}

export function PostStats({ quantity, condition, category }: PostStatsProps) {
  const items = [
    {
      icon: <Package className="size-5" />,
      label: "Số lượng",
      value: String(quantity),
    },
    {
      icon: <Sparkles className="size-5" />,
      label: "Tình trạng",
      value: CONDITION_LABEL[condition] || condition,
    },
    {
      icon: <Tag className="size-5" />,
      label: "Loại đồ",
      value: CATEGORY_LABEL[category] || category,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 rounded-[15px] border border-[var(--border-green)] bg-white p-4 text-center"
        >
          <div className="text-brand-dark">{item.icon}</div>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="text-sm font-semibold text-brand-darker">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ComparisonColumn<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}
export function ComparisonTable<T>({ items, columns, getKey, highlightedKey, getLabel }: { items: T[]; columns: Array<ComparisonColumn<T>>; getKey: (item: T) => string; highlightedKey?: string; getLabel: (item: T) => string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card/70">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead className="bg-background/65 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-4 font-semibold">Path</th>
            {columns.map((column) => <th className={cn("px-4 py-4 font-semibold", column.className)} key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => {
            const key = getKey(item);
            const highlighted = key === highlightedKey;
            return (
              <tr key={key} className={cn("align-top transition-colors hover:bg-white/[0.025]", highlighted && "bg-primary/[0.055]")}>
                <th className="px-4 py-5 font-semibold">
                  <div className="flex items-center gap-2">{getLabel(item)}{highlighted ? <Badge variant="success"><CheckCircle2 className="size-3" /> Best fit</Badge> : null}</div>
                </th>
                {columns.map((column) => <td className={cn("px-4 py-5 text-muted-foreground", column.className)} key={column.key}>{column.render(item)}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

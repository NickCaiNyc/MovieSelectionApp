import { cn } from "../lib/utils";

const legendItems = [
  { label: "Available", className: "bg-emerald-500" },
  { label: "Taken", className: "bg-rose-500" },
  { label: "Restricted", className: "bg-stone-500" },
  { label: "Highlighted", className: "bg-primary" },
];

export function SeatLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-4 text-sm text-muted-foreground", className)}>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded", item.className)} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

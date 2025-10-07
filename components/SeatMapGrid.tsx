import { SeatBlock } from "../lib/seatScore";
import { cn } from "../lib/utils";

interface SeatMapGridProps {
  rows: number;
  cols: number;
  taken?: number[][];
  restricted?: number[][];
  highlights?: SeatBlock[];
}

export function SeatMapGrid({ rows, cols, taken = [], restricted = [], highlights = [] }: SeatMapGridProps) {
  const takenSet = new Set(taken.map(([r, c]) => `${r}-${c}`));
  const restrictedSet = new Set(restricted.map(([r, c]) => `${r}-${c}`));
  const highlightSet = new Set<string>();

  highlights.forEach((block) => {
    for (let offset = 0; offset < block.size; offset++) {
      highlightSet.add(`${block.row}-${block.col + offset}`);
    }
  });

  return (
    <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, col) => {
            const key = `${row}-${col}`;
            const isTaken = takenSet.has(key);
            const isRestricted = restrictedSet.has(key);
            const isHighlighted = highlightSet.has(key);
            return (
              <div
                key={col}
                className={cn(
                  "aspect-square rounded-sm border border-transparent",
                  isHighlighted && "bg-primary",
                  isTaken && "bg-rose-500",
                  isRestricted && "bg-stone-500",
                  !isTaken && !isRestricted && !isHighlighted && "bg-emerald-600/70",
                  "transition-colors"
                )}
                title={`Row ${row + 1}, Seat ${col + 1}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

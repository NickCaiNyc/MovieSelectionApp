export type SeatGrade = "A" | "A-" | "B+" | "B" | "C";

export interface SeatBlock {
  id: string;
  row: number;
  col: number;
  size: number;
  score: number;
  grade: SeatGrade;
}

interface SeatScoreOptions {
  rows: number;
  cols: number;
  taken: number[][];
  restricted?: number[][];
  partySize: number;
  preferredZones?: { rowStart: number; rowEnd: number }[];
}

const gradeThresholds: [SeatGrade, number][] = [
  ["A", 0.85],
  ["A-", 0.75],
  ["B+", 0.65],
  ["B", 0.5],
  ["C", 0],
];

function toGrade(score: number): SeatGrade {
  return gradeThresholds.find(([, threshold]) => score >= threshold)?.[0] ?? "C";
}

export function scoreSeatMap(options: SeatScoreOptions) {
  const { rows, cols, taken, restricted = [], partySize, preferredZones = [] } = options;
  const blocks: SeatBlock[] = [];

  const restrictedSet = new Set(restricted.map(([r, c]) => `${r}-${c}`));
  const takenSet = new Set(taken.map(([r, c]) => `${r}-${c}`));

  for (let row = 0; row < rows; row++) {
    let consecutive = 0;
    for (let col = 0; col < cols; col++) {
      const key = `${row}-${col}`;
      if (takenSet.has(key) || restrictedSet.has(key)) {
        consecutive = 0;
        continue;
      }
      consecutive += 1;
      if (consecutive >= partySize) {
        const startCol = col - partySize + 1;
        const score = computeBlockScore({ row, startCol, partySize, rows, cols, preferredZones });
        blocks.push({
          id: `${row}-${startCol}`,
          row,
          col: startCol,
          size: partySize,
          score,
          grade: toGrade(score),
        });
      }
    }
  }

  blocks.sort((a, b) => b.score - a.score);
  return blocks;
}

function computeBlockScore({
  row,
  startCol,
  partySize,
  rows,
  cols,
  preferredZones,
}: {
  row: number;
  startCol: number;
  partySize: number;
  rows: number;
  cols: number;
  preferredZones: { rowStart: number; rowEnd: number }[];
}) {
  const centerCol = (cols - 1) / 2;
  const blockCenter = startCol + (partySize - 1) / 2;
  const horizontalProximity = 1 - Math.min(Math.abs(blockCenter - centerCol) / centerCol, 1);
  const verticalProximity = 1 - row / rows;

  const zoneBoost = preferredZones.some((zone) => row >= zone.rowStart && row <= zone.rowEnd)
    ? 0.1
    : 0;

  return Number((0.6 * horizontalProximity + 0.3 * verticalProximity + zoneBoost).toFixed(4));
}

import { z } from "zod";
import { prisma } from "../db";
import { publicProcedure, router } from "../trpc";
import { scoreSeatMap } from "../../lib/seatScore";

function databaseReady() {
  return Boolean(process.env.DATABASE_URL);
}

export const seatsRouter = router({
  topBlocks: publicProcedure
    .input(
      z.object({
        showtimeId: z.string(),
        partySize: z.number().min(1).max(10).default(2),
      })
    )
    .query(async ({ input }) => {
      if (!databaseReady()) {
        const mock = mockSeatMaps.find((map) => map.showtimeId === input.showtimeId);
        if (!mock) {
          return { seatMap: null, blocks: [] };
        }
        return {
          seatMap: {
            rows: mock.rows,
            cols: mock.cols,
            taken: mock.taken,
            restricted: mock.restricted,
          },
          blocks: scoreSeatMap({
            rows: mock.rows,
            cols: mock.cols,
            taken: mock.taken,
            restricted: mock.restricted,
            partySize: input.partySize,
            preferredZones: mock.preferredZones,
          }),
        };
      }

      const seatMap = await prisma.seatMap.findUnique({
        where: { showtimeId: input.showtimeId },
      });

      if (!seatMap) {
        const mock = mockSeatMaps.find((map) => map.showtimeId === input.showtimeId);
        if (!mock) return { seatMap: null, blocks: [] };
        return {
          seatMap: {
            rows: mock.rows,
            cols: mock.cols,
            taken: mock.taken,
            restricted: mock.restricted,
          },
          blocks: scoreSeatMap({
            rows: mock.rows,
            cols: mock.cols,
            taken: mock.taken,
            restricted: mock.restricted,
            partySize: input.partySize,
            preferredZones: mock.preferredZones,
          }),
        };
      }

      const taken = seatMap.taken as number[][];
      const restricted = (seatMap.restricted as number[][] | null) ?? [];

      return {
        seatMap: {
          rows: seatMap.rows,
          cols: seatMap.cols,
          taken,
          restricted,
        },
        blocks: scoreSeatMap({
          rows: seatMap.rows,
          cols: seatMap.cols,
          taken,
          restricted,
          partySize: input.partySize,
        }),
      };
    }),
});

const mockSeatMaps = [
  {
    id: "mock-seatmap-1",
    showtimeId: "mock-showtime-1",
    rows: 12,
    cols: 18,
    taken: [
      [5, 8],
      [5, 9],
      [6, 8],
      [6, 9],
    ],
    restricted: [
      [0, 0],
      [0, 1],
      [0, 16],
      [0, 17],
    ],
    preferredZones: [
      { rowStart: 4, rowEnd: 7 },
    ],
  },
];

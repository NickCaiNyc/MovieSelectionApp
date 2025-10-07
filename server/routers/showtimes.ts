import { z } from "zod";
import { prisma } from "../db";
import { publicProcedure, router } from "../trpc";
import { haversineDistanceKm } from "../../lib/distance";

function databaseReady() {
  return Boolean(process.env.DATABASE_URL);
}

export const showtimesRouter = router({
  nearby: publicProcedure
    .input(
      z.object({
        movieId: z.string(),
        userLocation: z
          .object({
            lat: z.number(),
            lon: z.number(),
          })
          .optional(),
        radiusKm: z.number().min(1).max(200).default(25),
      })
    )
    .query(async ({ input }) => {
      const { movieId, userLocation, radiusKm } = input;

      if (!databaseReady()) {
        return mockShowtimes.filter((show) => show.movieId === movieId);
      }

      const showtimes = await prisma.showtime.findMany({
        where: { movieId },
        include: { theater: true },
        take: 25,
      });

      if (showtimes.length === 0) {
        return mockShowtimes.filter((show) => show.movieId === movieId);
      }

      if (!userLocation) {
        return showtimes;
      }

      return showtimes.filter((show) => {
        const distance = haversineDistanceKm(userLocation, {
          lat: show.theater.lat,
          lon: show.theater.lon,
        });
        return distance <= radiusKm;
      });
    }),
});

const mockShowtimes = [
  {
    id: "mock-showtime-1",
    movieId: "603692",
    theaterId: "mock-theater-1",
    startAt: new Date().toISOString(),
    theater: {
      id: "mock-theater-1",
      name: "Downtown Cinema 12",
      city: "San Francisco",
      lat: 37.7858,
      lon: -122.4064,
    },
  },
];

import { z } from "zod";
import { prisma } from "../db";
import { publicProcedure, router } from "../trpc";

const prefsSchema = z.object({
  userId: z.string(),
  zone: z.string().default("mid"),
  timeStart: z.number().int().min(0).max(23).default(18),
  timeEnd: z.number().int().min(0).max(23).default(22),
  radiusKm: z.number().int().min(1).max(200).default(25),
  partySize: z.number().int().min(1).max(10).default(2),
});

const defaultPrefs = {
  zone: "mid",
  timeStart: 18,
  timeEnd: 22,
  radiusKm: 25,
  partySize: 2,
};

function databaseReady() {
  return Boolean(process.env.DATABASE_URL);
}

export const prefsRouter = router({
  get: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      if (!databaseReady()) {
        return { userId: input.userId, ...defaultPrefs };
      }

      try {
        const pref = await prisma.userPref.findUnique({ where: { userId: input.userId } });
        return pref ?? { userId: input.userId, ...defaultPrefs };
      } catch (error) {
        console.warn("prefs.get failed", error);
        return { userId: input.userId, ...defaultPrefs };
      }
    }),
  save: publicProcedure.input(prefsSchema).mutation(async ({ input }) => {
    if (!databaseReady()) {
      console.warn("Skipping preference persistence because DATABASE_URL is not configured.");
      return { ...defaultPrefs, userId: input.userId, ...input };
    }

    try {
      const pref = await prisma.userPref.upsert({
        where: { userId: input.userId },
        update: input,
        create: input,
      });
      return pref;
    } catch (error) {
      console.error("prefs.save failed", error);
      throw error;
    }
  }),
});

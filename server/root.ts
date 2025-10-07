import { router } from "./trpc";
import { moviesRouter } from "./routers/movies";
import { showtimesRouter } from "./routers/showtimes";
import { seatsRouter } from "./routers/seats";
import { prefsRouter } from "./routers/prefs";

export const appRouter = router({
  movies: moviesRouter,
  showtimes: showtimesRouter,
  seats: seatsRouter,
  prefs: prefsRouter,
});

export type AppRouter = typeof appRouter;

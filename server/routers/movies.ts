import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const TMDB_API_URL = "https://api.themoviedb.org/3";

export const moviesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          query: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      if (!process.env.TMDB_API_KEY) {
        return {
          source: "mock",
          results: mockMovies,
          note: "TMDB_API_KEY not set. Returning mock data.",
        };
      }

      const search = input?.query?.trim();
      const endpoint = search ? `/search/movie?query=${encodeURIComponent(search)}` : "/movie/now_playing";
      const response = await fetch(`${TMDB_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          "Content-Type": "application/json;charset=utf-8",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        return {
          source: "mock",
          results: mockMovies,
          note: "TMDB request failed. Returning mock data.",
        };
      }

      const data = await response.json();
      return {
        source: "tmdb",
        results: data.results ?? [],
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      if (!process.env.TMDB_API_KEY) {
        return mockMovies.find((movie) => String(movie.id) === input.id) ?? null;
      }

      const response = await fetch(`${TMDB_API_URL}/movie/${input.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          "Content-Type": "application/json;charset=utf-8",
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        return mockMovies.find((movie) => String(movie.id) === input.id) ?? null;
      }

      return response.json();
    }),
});

const mockMovies = [
  {
    id: 603692,
    title: "John Wick: Chapter 4",
    overview: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.",
    poster_path: "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    vote_average: 7.8,
    release_date: "2023-03-22",
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    vote_average: 8.4,
    release_date: "2023-05-31",
  },
];

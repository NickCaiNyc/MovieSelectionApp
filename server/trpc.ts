import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { NextRequest } from "next/server";

export const createContext = async (_req?: NextRequest) => ({
  // TODO: Add authenticated user context when Supabase auth is wired up.
  user: null as null,
});

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

import { appRouter } from "./root";
import { createContext } from "./trpc";

export async function createCaller() {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
}

import { z } from "zod";
import { transactionRouter } from "./routers/transaction";
import { possessionRouter } from "./routers/possession";
import { balanceRouter } from "./routers/balance";
import { createTRPCRouter, publicProcedure } from "./trpc";
import { historyRouter } from "./routers/history";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
    hello: publicProcedure
        .input(z.object({ text: z.string().nullish() }))
        .query(({ input }) => {
            return {
                greeting: `Welcome, ${input.text ?? "Anonymous"}`,
            };
        }),
    transaction: transactionRouter,
    possession: possessionRouter,
    balance: balanceRouter,
    history: historyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

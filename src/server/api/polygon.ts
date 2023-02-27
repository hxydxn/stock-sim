import { restClient } from "@polygon.io/client-js";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const rest = restClient(process.env.POLYGON_API_KEY);

// Get Current Date
const today = new Date();
const dd = String(today.getDate()).padStart(2, "0");
const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
const yyyy = today.getFullYear();

// Get Last Month Date
const lastMonth = new Date();
const ldd = String(lastMonth.getDate()).padStart(2, "0");
const lmm = String(lastMonth.getMonth() + 1).padStart(2, "0"); //January is 0!
const lyyyy = lastMonth.getFullYear();


export const stockRouter = createTRPCRouter({
  bySymbol: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(({ input }) => {
      return rest.stocks.previousClose(input.symbol);
    }),

  getLastDay: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(({ ctx, input }) => {
      return rest.stocks.aggregates(
        input.symbol,
        5,
        "minute",
        "2021-05-01",
        "2021-05-05",
        { unadjusted: true },
      );
    }),

  getLastWeek: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(({ ctx, input }) => {
      return rest.stocks.aggregates(
        input.symbol,
        30,
        "minute",
        "2021-04-26",
        "2021-05-03",
        { unadjusted: true },
      );
    }),

  getLastMonth: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(({ ctx, input }) => {
      return rest.stocks.aggregates(
        input.symbol,
        1,
        "day",
        "2021-04-01",
        "2021-05-01",
        { unadjusted: true },
      );
    });
});

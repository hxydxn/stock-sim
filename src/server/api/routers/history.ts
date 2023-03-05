import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { restClient } from "@polygon.io/client-js";
import { z } from "zod";
import moment, { Moment } from "moment";

enum HistorySpanProto {
    WEEK,
    MONTH,
    DAY,
}

const historySchema = z.object({
    stock: z.string().min(1).max(6),
    span: z.nativeEnum(HistorySpanProto),
});

const spanRequest = (span: HistorySpanProto) => {
    const today: string = moment().format("YYYY-MM-DD");
    const start = moment();
    let resolution = 5;
    let frequency = "minute";
    switch (span) {
        case HistorySpanProto.WEEK:
            start.subtract(1, "week");
            resolution = 30;
            break;
        case HistorySpanProto.MONTH:
            start.subtract(1, "month");
            resolution = 1;
            frequency = "day";
            break;
        case HistorySpanProto.DAY:
            start.subtract(1, "day");
            resolution = 5;
            break;
    }

    return {
        end: today,
        start: start.format("YYYY-MM-DD"),
        resolution: resolution,
        frequency: frequency,
    };
};

const polygonHistory = async (symbol: string, span: HistorySpanProto) => {
    const rest = restClient(process.env.POLYGON_API_KEY);
    const { start, end, resolution, frequency } = spanRequest(span);
    try {
        const response = await rest.stocks.aggregates(
            symbol,
            resolution,
            frequency,
            start,
            end,
        );
        const results = response.results;
        if (results) {
            return results;
        }
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No results found for polygon5Day",
        });
    } catch (error) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "429 Too Many Requests",
        });
    }
};

export const historyRouter = createTRPCRouter({
    getVOT: protectedProcedure
        .input(historySchema)
        .query(async ({ ctx, input }) => {
            const transactions = await ctx.prisma.transaction.findMany({
                where: {
                    userId: ctx.session.user.id,
                    stock: input.stock,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            if (!transactions) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No transactions found",
                });
            }
            let history = null;
            try {
                history = await polygonHistory(input.stock, input.span);
            } catch (error) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No history found",
                });
            }
            let stock_prefix = 0;
            let transactions_index = 0;
            const vot = history.reduce((a, c) => {
                if (transactions_index >= transactions.length) {
                    a.push({ t: c.t, v: stock_prefix * c.c, s: stock_prefix });
                    return a;
                }
                if (
                    c.t >= transactions[transactions_index].createdAt.getTime()
                ) {
                    while (
                        transactions_index < transactions.length &&
                        c.t >=
                            transactions[transactions_index].createdAt.getTime()
                    ) {
                        const t = transactions[transactions_index];
                        stock_prefix += t.type === "BUY" ? t.amount : -t.amount;
                        transactions_index++;
                    }
                }
                a.push({ t: c.t, v: stock_prefix * c.c, s: stock_prefix });
                return a;
            }, []);

            return vot;
        }),
    getStocks: protectedProcedure.query(async ({ ctx }) => {
        const vals = await ctx.prisma.possession.findMany({
            distinct: ["stock"],
            select: {
                stock: true,
            },
        });
        return vals;
    }),
});

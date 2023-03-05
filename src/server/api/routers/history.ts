import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { HistorySchema } from "../types/history";
import type { ValueOverTime } from "../types/history";
import { polygonHistory } from "../lib/polygon";

export const historyRouter = createTRPCRouter({
    getVOT: protectedProcedure
        .input(HistorySchema)
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
                    message: "429 Too Many Requests for history",
                });
            }
            let stock_prefix = 0;
            let transactions_index = 0;
            const vot: ValueOverTime[] = history.reduce((a, c) => {
                if (!c.c || !c.t) {
                    return a;
                }
                if (transactions_index >= transactions.length) {
                    a.push({ time: c.t, value: stock_prefix * c.c });
                    return a;
                }

                if (
                    c.t >= transactions[transactions_index]!.createdAt.getTime()
                ) {
                    while (
                        transactions_index < transactions.length &&
                        c.t >=
                            transactions[
                                transactions_index
                            ]!.createdAt.getTime()
                    ) {
                        const t = transactions[transactions_index];
                        stock_prefix +=
                            t!.type === "BUY" ? t!.amount : -t!.amount;
                        transactions_index++;
                    }
                }
                a.push({ time: c.t, value: stock_prefix * c.c });
                return a;
            }, [] as ValueOverTime[]);

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

import { z } from "zod";
import { transactionPutSchema } from "../types/transaction";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { polygonLatest } from "../lib/polygon";

export const transactionRouter = createTRPCRouter({
    getTotalPortfolioVal: protectedProcedure.query(async ({ ctx }) => {
        const possessions = await ctx.prisma.possession.findMany({
            where: {
                userId: ctx.session.user.id,
            },
        });
        const balance = await ctx.prisma.user.findFirst({
            where: {
                id: ctx.session.user.id,
            },
            select: { balance: true },
        });
        let total = 0;
        if (balance) {
            total += balance.balance;
        }
        for (const possession of possessions) {
            const price = await polygonLatest(possession.stock);
            total += price * possession.amount;
        }
        return total;
    }),

    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.transaction.findMany({
            orderBy: {
                createdAt: "desc",
            },
            where: {
                userId: ctx.session.user.id,
            },
        });
    }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().cuid() }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.transaction.delete({
                where: {
                    id: input.id,
                },
            });
        }),

    create: protectedProcedure
        .input(transactionPutSchema)
        .mutation(async ({ ctx, input }) => {
            const price = await polygonLatest(input.stock);
            const currentAmount = await ctx.prisma.possession.findFirst({
                select: { amount: true, id: true },
                where: {
                    userId: ctx.session.user.id,
                    stock: input.stock,
                },
            });
            const currentBalance = await ctx.prisma.user.findFirst({
                select: { balance: true, id: true },
                where: {
                    id: ctx.session.user.id,
                },
            });

            if (input.type === "DEPOSIT" || input.type === "WITHDRAW") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        "Use the balance router to deposit or withdraw money",
                });
            } else if (input.type === "SELL") {
                if (!currentAmount) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "You don't own this stock and therefore can't sell any.",
                    });
                }
                if (currentAmount.amount < input.amount) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: `You don't own ${input.amount} of this stock.`,
                    });
                }
                if (!currentBalance) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "User not found",
                    });
                }
                await ctx.prisma.possession.update({
                    where: {
                        id: currentAmount.id,
                    },
                    data: {
                        amount: currentAmount.amount - input.amount,
                    },
                });
                await ctx.prisma.user.update({
                    where: {
                        id: currentBalance.id,
                    },
                    data: {
                        balance: currentBalance.balance + input.amount * price,
                    },
                });
            } else if (input.type === "BUY") {
                if (!currentBalance) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "User not found",
                    });
                }
                if (currentBalance.balance < input.amount * price) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                            "You don't have enough money to buy this stock.",
                    });
                }
                if (currentAmount) {
                    await ctx.prisma.possession.update({
                        where: {
                            id: currentAmount.id,
                        },
                        data: {
                            amount: currentAmount.amount + input.amount,
                        },
                    });
                } else {
                    await ctx.prisma.possession.create({
                        data: {
                            user: { connect: { id: ctx.session.user.id } },
                            stock: input.stock,
                            amount: input.amount,
                        },
                    });

                    await ctx.prisma.user.update({
                        where: {
                            id: currentBalance.id,
                        },
                        data: {
                            balance:
                                currentBalance.balance - input.amount * price,
                        },
                    });
                }
            }

            return await ctx.prisma.transaction.create({
                data: {
                    type: input.type,
                    stock: input.stock,
                    amount: input.amount,
                    price: price,
                    user: { connect: { id: ctx.session.user.id } },
                },
            });
        }),
});

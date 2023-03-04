import { z } from "zod";
import { transactionPutSchema } from "~/pages/portfolio";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { restClient } from "@polygon.io/client-js";

export const polygon = async (symbol: string) => {
  const rest = restClient(process.env.POLYGON_API_KEY);
  try {
    const response = await rest.stocks.previousClose(symbol);
    // Get the previous close price as a number
    const previousClose = response.results[0].c;
    if (previousClose) {
      return previousClose;
    }
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No previous close price found",
    });
  } catch (error) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "429 Too Many Requests",
    });
  }
};

export const transactionRouter = createTRPCRouter({
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
      const price = await polygon(input.stock);
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
          message: "Use the balance router to deposit or withdraw money",
        });
      } else if (input.type === "SELL") {
        if (!currentAmount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You don't own this stock and therefore can't sell any.",
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
            message: "You don't have enough money to buy this stock.",
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

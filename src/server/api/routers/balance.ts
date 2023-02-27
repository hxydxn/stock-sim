import { z } from "zod";
import { balanceUpdateSchema } from "~/pages/portfolio";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const balanceRouter = createTRPCRouter({
  byUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        balance: true,
      },
    });
  }),

  update: protectedProcedure
    .input(balanceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const currentBalance = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          balance: true,
        },
      });

      if (!currentBalance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User not found",
        });
      }

      if (input.type === "BUY" || input.type === "SELL") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Use the transaction router to buy or sell stocks",
        });
      } else if (input.type === "DEPOSIT") {
        return ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            balance: currentBalance.balance + input.amount,
          },
        });
      } else if (input.type === "WITHDRAW") {
        if (currentBalance.balance < input.amount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient funds",
          });
        }
        return ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            balance: currentBalance.balance - input.amount,
          },
        });
      }
    }),
});

import { z } from "zod";
import { balanceUpdateSchema } from "~/pages/portfolio";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const balanceRouter = createTRPCRouter({
  byUser: protectedProcedure.query(async ({ ctx }) => {
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

      if (input.type === "deposit") {
        return ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            balance: currentBalance.balance + input.amount,
          },
        });
      } else if (input.type === "withdraw") {
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

import { z } from "zod";
import { transactionCreateSchema } from "~/pages/portfolio";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const transactionRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.transaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: { user: true },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.transaction.delete({
        where: {
          id: input.id,
        },
      });
    }),

  create: protectedProcedure
    .input(transactionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const currentAmount = await ctx.prisma.possesion.findFirst({
        select: { amount: true, id: true },
        where: {
          userId: ctx.session.user.id,
          stock: input.stock,
        },
      });

      if (input.type === "SELL") {
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
        await ctx.prisma.possesion.update({
          where: {
            id: currentAmount.id,
          },
          data: {
            amount: currentAmount.amount - input.amount,
          },
        });
      } else if (input.type === "BUY") {
        if (currentAmount) {
          await ctx.prisma.possesion.update({
            where: {
              id: currentAmount.id,
            },
            data: {
              amount: currentAmount.amount + input.amount,
            },
          });
        } else {
          await ctx.prisma.possesion.create({
            data: {
              userId: ctx.session.user.id,
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
          price: input.price,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});

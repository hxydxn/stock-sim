import { z } from "zod";
import { transactionCreateSchema } from "~/pages/portfolio";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const transactionRouter = createTRPCRouter({
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.transaction.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.transaction.findMany({
      include: { user: true },
    });
  }),

  create: protectedProcedure
    .input(transactionCreateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.transaction.create({
        data: {
          amount: input.amount,
          type: input.type,
          user: { connect: { id: ctx.session.user.id } },
        },
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
});

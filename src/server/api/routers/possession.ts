import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const possessionRouter = createTRPCRouter({
  byUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.possesion.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
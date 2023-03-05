import { createTRPCRouter, protectedProcedure } from "../trpc";

export const possessionRouter = createTRPCRouter({
    byUser: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.possession.findMany({
            where: {
                userId: ctx.session.user.id,
            },
            select: {
                amount: true,
                id: true,
                stock: true,
            },
        });
    }),
});

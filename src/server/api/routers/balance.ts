import { z } from "zod";
import { balanceUpdateSchema } from "~/pages/portfolio";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const balanceRouter = createTRPCRouter({});

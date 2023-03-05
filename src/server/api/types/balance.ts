import { z } from "zod";
import { TransactionCategory } from "@prisma/client";

/* imports */
const balanceUpdateSchema = z.object({
    amount: z.number().min(0.01).multipleOf(0.01),
    type: z.nativeEnum(TransactionCategory),
});

export { balanceUpdateSchema };

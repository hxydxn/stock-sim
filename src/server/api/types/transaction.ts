import { z } from "zod";
import { TransactionCategory } from "@prisma/client";

/* imports */
const transactionPutSchema = z.object({
    stock: z.string().min(1).max(6),
    amount: z.number().int().positive(),
    type: z.nativeEnum(TransactionCategory),
});

export { transactionPutSchema };

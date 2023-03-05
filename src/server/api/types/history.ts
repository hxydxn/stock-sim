import { z } from "zod";

/* inputs */
enum HistorySpan {
    WEEK,
    MONTH,
    DAY,
}

const HistorySchema = z.object({
    stock: z.string().min(1).max(6),
    span: z.nativeEnum(HistorySpan),
});

/* outputs */

interface ValueOverTime {
    value: number | undefined;
    time: number | undefined;
}

export { HistorySpan, HistorySchema };
export type { ValueOverTime };

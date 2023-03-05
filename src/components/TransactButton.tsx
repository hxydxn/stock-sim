import { useSession } from "next-auth/react";
import { Button } from "~/ui/button";
import { api } from "~/utils/api";
import { Input } from "~/ui/input";
import { useZodForm } from "~/utils/zod-form";
import { transactionPutSchema } from "~/server/api/types/transaction";
import { Label } from "~/ui/label";
import { Controller } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/ui/select";

export const TransactButton: React.FC = () => {
    const methods = useZodForm({
        schema: transactionPutSchema,
    });
    const { data: session } = useSession();
    const utils = api.useContext();
    const createTransaction = api.transaction.create.useMutation({
        onSettled: async () => {
            await utils.transaction.invalidate();
            methods.reset();
        },
    });

    const onSubmit = methods.handleSubmit(
        (data) => {
            createTransaction.mutate(data);
        },
        (e) => {
            console.log("Whoops... something went wrong!");
            console.error(e);
        },
    );

    return (
        <div className={"container max-w-xs items-center"}>
            <form action="" className="flex flex-col gap-4" onSubmit={onSubmit}>
                <div className="space-y-1">
                    <Label htmlFor="name">Stock Ticker</Label>
                    <Input
                        id="stock"
                        className="bg-slate-800"
                        value={"GME"}
                        {...methods.register("stock")}
                    />
                    <p className="font-medium text-red-500">
                        {methods.formState.errors?.stock?.message}
                    </p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="name">Amount (# of Shares)</Label>
                    <Input
                        id="amount"
                        className="bg-slate-800"
                        {...methods.register("amount", { valueAsNumber: true })}
                    />
                    <p className="font-medium text-red-500">
                        {methods.formState.errors?.amount?.message}
                    </p>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                        control={methods.control}
                        name="type"
                        render={({ field }) => (
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="bg-slate-800">
                                    <SelectValue placeholder="Type of Transaction" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUY">Buy</SelectItem>
                                    <SelectItem value="SELL">Sell</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    <p className="font-medium text-red-500">
                        {methods.formState.errors?.type?.message}
                    </p>
                </div>

                <Button size="lg" type="submit" disabled={!session}>
                    {!session
                        ? "Sign in to Buy/Sell"
                        : createTransaction.isLoading
                        ? "Loading..."
                        : "Transact"}
                </Button>
                <p className="font-medium text-red-500">
                    {createTransaction.error?.message}
                </p>
            </form>
        </div>
    );
};

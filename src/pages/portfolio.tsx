import { useSession } from "next-auth/react";
import { Button } from "~/ui/button";
import Link from "next/link";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/ui/select";
import { api, type RouterOutputs } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";
import { Controller } from "react-hook-form";
import { balanceUpdateSchema } from "~/server/api/types/balance";
import { NavBar } from "~/components/NavBar";

function CreateAccountBalance() {
    const { data: balance } = api.balance.byUser.useQuery();
    const { data: possessions } = api.possession.byUser.useQuery();

    const methods = useZodForm({
        schema: balanceUpdateSchema,
    });

    const utils = api.useContext();

    const editBalance = api.balance.update.useMutation({
        onSettled: async () => {
            await utils.balance.invalidate();
            methods.reset();
        },
    });

    const onSubmit = methods.handleSubmit(
        (data) => {
            editBalance.mutate(data);
        },
        (e) => {
            console.log("Whoops... something went wrong!");
            console.error(e);
        },
    );

    const { data: portfolioVal } =
        api.transaction.getTotalPortfolioVal.useQuery();

    return (
        <div className="mx-auto max-w-xl">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 pb-8 ">
                <h1 className="text-4xl font-bold">Portfolio</h1>
                <div className="flex w-full flex-col items-center gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
                    <h3 className="text-center text-2xl font-bold">
                        Total Portfolio Value
                    </h3>
                    <p className="text-center">${portfolioVal}</p>
                    <Link href="/chart">
                        <Button>View Portfolio History</Button>
                    </Link>
                </div>
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                    <div className="flex max-w-md flex-col rounded-xl bg-white/10 p-4 hover:bg-white/20">
                        <h3 className="text-center text-xl font-bold">
                            Current Balance
                        </h3>
                        <p className="text-center">${balance?.balance}</p>
                        <form
                            onSubmit={onSubmit}
                            className="flex flex-col gap-4"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    {...methods.register("amount", {
                                        valueAsNumber: true,
                                    })}
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                />
                                <p className="font-medium text-red-500">
                                    {methods.formState.errors?.amount?.message}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <Label>Type</Label>
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
                                                <SelectItem value="DEPOSIT">
                                                    Deposit
                                                </SelectItem>
                                                <SelectItem value="WITHDRAW">
                                                    Withdraw
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <p className="font-medium text-red-500">
                                    {methods.formState.errors?.type?.message}
                                </p>
                            </div>
                            <Button type="submit">Update Balance</Button>
                            <p className="font-medium text-red-500">
                                {editBalance.error?.message}
                            </p>
                        </form>
                    </div>
                    <div className="flex max-w-md flex-col rounded-xl bg-white/10 p-4 hover:bg-white/20">
                        <h3 className="text-center text-xl font-bold">
                            Current Shares Held
                        </h3>
                        <div className="text-center">
                            {possessions?.map((possession) => (
                                <PossessionCard
                                    key={possession.id}
                                    possession={possession}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col rounded-xl bg-white/10 p-4">
                    <h3 className="text-center text-2xl font-bold">
                        Past Transactions
                    </h3>
                </div>
            </div>
        </div>
    );
}

function TransactionCard(props: {
    transaction: RouterOutputs["transaction"]["getAll"][number];
}) {
    const { transaction } = props;

    return (
        <div className="flex flex-row rounded-lg bg-white/10 p-4 transition-all hover:scale-[101%]">
            <div className="flex-grow">
                <div className="flex flex-row justify-between">
                    <h2 className="text-2xl font-bold">{transaction.stock}</h2>
                    <h1 className="text-gray text-xl font-bold">
                        {transaction.type}
                    </h1>
                </div>
                <p className="mt-2 text-sm">
                    {transaction.amount} shares @ ${transaction.price}
                </p>
            </div>
        </div>
    );
}

function PossessionCard(props: {
    possession: RouterOutputs["possession"]["byUser"][number];
}) {
    const { possession } = props;
    return (
        <div className="grid grid-cols-2 flex-row rounded-lg">
            <div>${possession.stock}</div>
            <div>{possession.amount}</div>
        </div>
    );
}

export default function PortfolioPage() {
    const { data: session } = useSession();
    const { data: transactions } = api.transaction.getAll.useQuery();
    if (session) {
        return (
            <main className="">
                <NavBar />
                <CreateAccountBalance />

                <div className="mx-auto flex max-w-xl flex-col gap-4">
                    {transactions?.map((transaction) => (
                        <TransactionCard
                            key={transaction.id}
                            transaction={transaction}
                        />
                    ))}
                </div>
            </main>
        );
    } else {
        return (
            <main className="">
                <NavBar />
                <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 text-center">
                    <h1 className="text-4xl font-bold">Portfolio</h1>
                    <p className="text-xl">
                        Please sign in to view your portfolio
                    </p>
                </div>
            </main>
        );
    }
}

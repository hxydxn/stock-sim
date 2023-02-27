import { Controller } from "react-hook-form";
import { z } from "zod";

import { TransactionCategory } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Button } from "~/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/ui/dialog";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";
import { Textarea } from "~/ui/text-area";
import { api, type RouterOutputs } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";

// This schema is reused on the backend
export const balanceUpdateSchema = z.object({
  amount: z.number().min(0.01).multipleOf(0.01),
  type: z.nativeEnum(TransactionCategory),
});

// This schema is reused on the backend
export const transactionCreateSchema = z.object({
  stock: z.string().min(1).max(6),
  amount: z.number().int().positive(),
  price: z.number().positive().multipleOf(0.01),
  type: z.nativeEnum(TransactionCategory),
});

function CreateAccountBalance() {
  const { data: session } = useSession();

  const methods = useZodForm({
    schema: balanceUpdateSchema,
  });

  const utils = api.useContext();
  const createPost = api.post.create.useMutation({
    onSettled: async () => {
      await utils.post.invalidate();
      methods.reset();
    },
  });

  const onSubmit = methods.handleSubmit(
    (data) => {
      createPost.mutate(data);
    },
    (e) => {
      console.log("Whoops... something went wrong!");
      console.error(e);
    },
  );

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-4xl font-bold">Portfolio</h1>
        <div className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
          <h3 className="text-center text-2xl font-bold">
            Total Portfolio Value
          </h3>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <div className="flex max-w-md flex-col rounded-xl bg-white/10 p-4 hover:bg-white/20">
            <h3 className="text-center text-xl font-bold">Current Balance</h3>
          </div>
          <div className="flex max-w-md flex-col rounded-xl bg-white/10 p-4 hover:bg-white/20">
            <h3 className="text-center text-xl font-bold">
              Current Shares Held
            </h3>
          </div>
        </div>
        <div className="flex w-full flex-col rounded-xl bg-white/10 p-4">
          <h3 className="text-center text-2xl font-bold">Past Transactions</h3>
        </div>
      </div>
      {/* <form action="" className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <Label htmlFor="name">Title</Label>
          <Input
            id="name"
            className="bg-slate-800"
            {...methods.register("title")}
          />
          <p className="font-medium text-red-500">
            {methods.formState.errors?.title?.message}
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="text">Body</Label>
          <Textarea
            id="text"
            className="bg-slate-800"
            {...methods.register("body")}
          />
          <p className="font-medium text-red-500">
            {methods.formState.errors?.body?.message}
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pet">Category</Label>
          <Controller
            control={methods.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-slate-800">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PostCategory).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          <p className="font-medium text-red-500">
            {methods.formState.errors?.category?.message}
          </p>
        </div>
        <Button type="submit" disabled={!session}>
          {!session
            ? "Sign in to Post"
            : createPost.isLoading
            ? "Loading..."
            : "Post"}
        </Button>
        <p className="font-medium text-red-500">{createPost.error?.message}</p>
      </form> */}
    </div>
  );
}

function TransactionCard(props: {
  transaction: RouterOutputs["transaction"]["getAll"][number];
}) {
  const { data: session } = useSession();
  const { transaction } = props;
  const utils = api.useContext();

  return (
    <div className="flex flex-row rounded-lg bg-white/10 p-4 transition-all hover:scale-[101%]">
      <div className="flex-grow">
        <div className="flex flex-row justify-between">
          <h2 className="text-2xl font-bold">{transaction.stock}</h2>
          <h1 className="text-gray text-xl font-bold">{transaction.type}</h1>
        </div>
        <p className="mt-2 text-sm">
          {transaction.amount} shares @ {transaction.price}
        </p>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { data: transactions } = api.transaction.getAll.useQuery();
  const { data: balance } = api.balance.byUser.useQuery();
  const { data: possessions } = api.possession.byUser.useQuery();

  return (
    <main className="container mx-auto py-16">
      <CreateAccountBalance />
      <div className="mx-auto mt-4 flex max-w-xl flex-col gap-4">
        {transactions?.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </main>
  );
}

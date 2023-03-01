import { Controller } from "react-hook-form";
import { z } from "zod";

import { TransactionCategory } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/avatar";
import { Button } from "~/ui/button";
import Link from "next/link";
import Image from "next/image";
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
  const { data: balance } = api.balance.byUser.useQuery();
  const { data: possessions } = api.possession.byUser.useQuery();
  // const totalStockVal = possessions?.forEach((possession) => {
  //   possession.amount * possession.stock.price
  // }, 0);
  // const totalVal = balance?.balance + possessions?.forEach((possession) => {
  //   possession.amount * possession.stock.price
  // }, 0)
  return (
    <div className="mx-auto max-w-xl">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 pb-8 ">
        <h1 className="text-4xl font-bold">Portfolio</h1>
        <div className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20">
          <h3 className="text-center text-2xl font-bold">
            Total Portfolio Value
          </h3>
          {/* <p className="text-center">${totalVal}</p> */}
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <div className="flex max-w-md flex-col rounded-xl bg-white/10 p-4 hover:bg-white/20">
            <h3 className="text-center text-xl font-bold">Current Balance</h3>
            <p className="text-center">${balance?.balance}</p>
          </div>
          <div className="flex max-w-md flex-col rounded-xl bg-white/10 p-4 hover:bg-white/20">
            <h3 className="text-center text-xl font-bold">
              Current Shares Held
            </h3>
            <div className="text-center">
              {possessions?.map((possession) => (
                <PossessionCard key={possession.id} possession={possession} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col rounded-xl bg-white/10 p-4">
          <h3 className="text-center text-2xl font-bold">Past Transactions</h3>
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
          <h1 className="text-gray text-xl font-bold">{transaction.type}</h1>
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
  const hello = api.hello.useQuery({ text: session?.user.name });
  const { data: transactions } = api.transaction.getAll.useQuery();
  if (session) {
    return (
      <main className="">
        <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <Image
              src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg"
              alt="Rocket logo"
              width={32}
              height={32}
            ></Image>
          </Link>
          <div className="flex items-center space-x-4">
            <p>{hello.data ? hello.data.greeting : "Loading tRPC query..."}</p>
            <div className="flex flex-col items-center justify-center gap-4">
              <Button
                variant="ghost"
                onClick={session ? () => signOut() : () => signIn()}
              >
                {session ? "Sign out" : "Sign in"}
              </Button>
            </div>
            <div className={session ? "" : "hidden"}>
              <Link href="/portfolio">
                <Button variant="destructive">Portfolio</Button>
              </Link>
            </div>
          </div>
        </nav>
        <CreateAccountBalance />

        <div className="mx-auto flex max-w-xl flex-col gap-4">
          {transactions?.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </main>
    );
  } else {
    return (
      <main className="">
        <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <Image
              src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg"
              alt="Rocket logo"
              width={32}
              height={32}
            ></Image>
          </Link>
          <div className="flex items-center space-x-4">
            <p>{hello.data ? hello.data.greeting : "Loading tRPC query..."}</p>
            <div className="flex flex-col items-center justify-center gap-4">
              <Button
                variant="ghost"
                onClick={session ? () => signOut() : () => signIn()}
              >
                {session ? "Sign out" : "Sign in"}
              </Button>
            </div>
            <div className={session ? "" : "hidden"}>
              <Link href="/portfolio">
                <Button variant="destructive">Portfolio</Button>
              </Link>
            </div>
          </div>
        </nav>
        <div className="mx-auto flex max-w-xl flex-col gap-4 p-4 text-center">
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-xl">Please sign in to view your portfolio</p>
        </div>
      </main>
    );
  }
}

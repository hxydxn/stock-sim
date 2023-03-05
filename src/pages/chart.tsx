import { api } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";
import { z } from "zod";
import { ColorType, createChart } from "lightweight-charts";
import { useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/ui/button";

enum HistorySpanProto {
    WEEK,
    MONTH,
    DAY,
}

const chartSchema = z.object({
    stock: z.string().min(1).max(6),
    span: z.nativeEnum(HistorySpanProto),
});

export default function Chart() {
    const { data: session } = useSession();
    const hello = api.hello.useQuery({ text: session?.user.name });
    const [rem, setRem] = useState<>(null);
    const charTainerRef = useRef();
    const opts = api.history.getStocks.useQuery();

    const methods = useZodForm({
        schema: chartSchema,
    });

    methods.watch("stock", (val) => {
        vot.refetch();
    });

    methods.watch("span", (val) => {
        vot.refetch();
    });

    const vot = api.history.getVOT.useQuery(methods.getValues(), {
        enabled: methods.formState.isValid,
        onSuccess: (data) => {
            console.log("making chart");
            if (rem) rem.remove();
            const chart = createChart(charTainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "#FFFFFF00" },
                },
                width: 700,
                height: 400,
            });
            chart.timeScale().fitContent();

            const ser = chart.addAreaSeries({
                lineColor: "#2962FF",
                topColor: "#2962FF",
                bottomColor: "rgba(41,98,255,0.28)",
            });
            const d2 = data.map((d) => {
                return { time: d.t, value: d.v };
            });

            ser.setData(d2);
            setRem(chart);
        },
    });
    if (session) {
        return (
            <div>
                <select className="text-black" {...methods.register("stock")}>
                    {opts?.data?.map((stock, i) => (
                        <option key={i} value={stock.stock}>
                            {stock.stock}
                        </option>
                    ))}
                </select>
                <select
                    className="text-black"
                    {...methods.register("span", { valueAsNumber: true })}
                >
                    <option value={"INVALID"}>Select</option>
                    <option value={HistorySpanProto.WEEK}>Week</option>
                    <option value={HistorySpanProto.MONTH}>Month</option>
                    <option value={HistorySpanProto.DAY}>Day</option>
                </select>

                <div ref={charTainerRef}></div>
            </div>
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
                        <p>
                            {hello.data
                                ? hello.data.greeting
                                : "Loading tRPC query..."}
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={
                                    session ? () => signOut() : () => signIn()
                                }
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
                    <h1 className="text-4xl font-bold">Portfolio History</h1>
                    <p className="text-xl">
                        Please sign in to view your portfolio history
                    </p>
                </div>
            </main>
        );
    }
}

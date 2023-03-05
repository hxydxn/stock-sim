import { api } from "~/utils/api";
import { useZodForm } from "~/utils/zod-form";
import type { IChartApi } from "lightweight-charts";
import { ColorType, createChart } from "lightweight-charts";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { ValueOverTime } from "~/server/api/types/history";
import { HistorySpan, HistorySchema } from "~/server/api/types/history";
import { NavBar } from "~/components/NavBar";

export default function Chart() {
    const { data: session } = useSession();
    const [rem, setRem] = useState<IChartApi | null>(null);
    const charTainerRef = useRef();
    const opts = api.history.getStocks.useQuery();

    const methods = useZodForm({
        schema: HistorySchema,
    });

    methods.watch(() => {
        void vot.refetch();
    });

    const vot = api.history.getVOT.useQuery(methods.getValues(), {
        enabled: methods.formState.isValid,
        onSuccess: (data: ValueOverTime[]) => {
            console.log("making chart");
            if (rem) rem.remove();
            const chart = createChart(charTainerRef.current!, {
                layout: {
                    background: { type: ColorType.Solid, color: "#FFF" },
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
            // data has to equal VolumeOverTime[]
            const d2 = data.map((d) => {
                return { time: d.time! / 1000, value: d.value! };
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ser.setData(d2);
            setRem(chart);
        },
    });
    if (session) {
        return (
            <main className="">
                <NavBar />
                <div className="mx-auto max-w-xl">
                    <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 pb-8 ">
                        <div>
                            <select
                                className="text-black"
                                {...methods.register("stock")}
                            >
                                {opts?.data?.map((stock, i) => (
                                    <option key={i} value={stock.stock}>
                                        {stock.stock}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="text-black"
                                {...methods.register("span", {
                                    valueAsNumber: true,
                                })}
                            >
                                <option value={"INVALID"}>Select</option>
                                <option value={HistorySpan.WEEK}>Week</option>
                                <option value={HistorySpan.MONTH}>Month</option>
                                <option value={HistorySpan.DAY}>Day</option>
                            </select>
                            {vot.isFetching && <p>Fetching...</p>}
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/*@ts-ignore*/}
                            <div ref={charTainerRef}></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    } else {
        return (
            <main className="">
                <NavBar />
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

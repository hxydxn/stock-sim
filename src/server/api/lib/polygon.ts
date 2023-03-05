import { TRPCError } from "@trpc/server";
import { restClient } from "@polygon.io/client-js";
import { HistorySpan } from "../types/history";
import moment from "moment";

const spanRequest = (span: HistorySpan) => {
    const today: string = moment().format("YYYY-MM-DD");
    const start = moment();
    let resolution = 5;
    let frequency = "minute";
    switch (span) {
        case HistorySpan.WEEK:
            start.subtract(1, "week");
            resolution = 30;
            break;
        case HistorySpan.MONTH:
            start.subtract(1, "month");
            resolution = 1;
            frequency = "day";
            break;
        case HistorySpan.DAY:
            start.subtract(1, "day");
            resolution = 5;
            break;
    }

    return {
        end: today,
        start: start.format("YYYY-MM-DD"),
        resolution: resolution,
        frequency: frequency,
    };
};

export const polygonHistory = async (symbol: string, span: HistorySpan) => {
    const rest = restClient(process.env.POLYGON_API_KEY);
    const { start, end, resolution, frequency } = spanRequest(span);
    try {
        const response = await rest.stocks.aggregates(
            symbol,
            resolution,
            frequency,
            start,
            end,
        );
        const results = response.results;
        if (results) {
            return results;
        }
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No results found for polygon5Day",
        });
    } catch (error) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "429 Too Many Requests",
        });
    }
};

export const polygonLatest = async (symbol: string) => {
    const rest = restClient(process.env.POLYGON_API_KEY);
    try {
        const response = await rest.stocks.previousClose(symbol);
        // Get the previous close price as a number
        if (!response) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No response found for polygonLatest",
            });
        }
        const previousClose = response.results![0]?.c;
        if (previousClose) {
            return previousClose;
        }
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No previous close price found",
        });
    } catch (error) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "429 Too Many Requests",
        });
    }
};

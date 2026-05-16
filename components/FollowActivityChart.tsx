"use client";

import { useMemo } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";
import type { TimestampedUser } from "@/lib/instagram";
import { messages } from "@/lib/i18n";

type DateDatum = {
  date: Date;
  count: number;
};

type FollowActivityChartProps = {
  followerTimestamps: TimestampedUser[];
  followingTimestamps: TimestampedUser[];
};

function aggregateByMonth(users: TimestampedUser[]): DateDatum[] {
  const buckets = new Map<string, number>();

  for (const { timestamp } of users) {
    const d = new Date(timestamp * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [year, month] = key.split("-").map(Number);
      return { date: new Date(year!, month! - 1, 1), count };
    });
}

const copy = messages.chart;

export function FollowActivityChart({
  followerTimestamps,
  followingTimestamps,
}: FollowActivityChartProps) {
  const data = useMemo(() => {
    const followersAgg = aggregateByMonth(followerTimestamps);
    const followingAgg = aggregateByMonth(followingTimestamps);

    return [
      { label: copy.followersLine, data: followersAgg },
      { label: copy.followingLine, data: followingAgg },
    ];
  }, [followerTimestamps, followingTimestamps]);

  const primaryAxis = useMemo(
    (): AxisOptions<DateDatum> => ({
      getValue: (datum) => datum.date,
      scaleType: "localTime",
    }),
    [],
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<DateDatum>[] => [
      {
        getValue: (datum) => datum.count,
        elementType: "line",
        showDatumElements: "onFocus",
      },
    ],
    [],
  );

  const hasData =
    data[0]!.data.length > 0 || data[1]!.data.length > 0;

  if (!hasData) return null;

  return (
    <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <h3 className="mb-4 text-sm font-semibold text-blue-200/80">
        {copy.title}
      </h3>
      <div className="h-72 w-full">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
            dark: true,
            defaultColors: ["#38bdf8", "#a78bfa"],
            tooltip: {
              groupingMode: "primary",
            },
          }}
        />
      </div>
    </section>
  );
}

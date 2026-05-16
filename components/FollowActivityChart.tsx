"use client";

import { useCallback, useMemo, useState } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";
import { ZoomIn, ZoomOut } from "lucide-react";
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

type DateRange = { min: Date; max: Date } | null;

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
  const [zoomRange, setZoomRange] = useState<DateRange>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const allData = useMemo(() => {
    const followersAgg = aggregateByMonth(followerTimestamps);
    const followingAgg = aggregateByMonth(followingTimestamps);
    return [
      { label: copy.followersLine, data: followersAgg },
      { label: copy.followingLine, data: followingAgg },
    ];
  }, [followerTimestamps, followingTimestamps]);

  const data = useMemo(() => {
    const visible = allData.filter((s) => !hiddenSeries.has(s.label));
    if (!zoomRange) return visible;
    return visible.map((series) => ({
      ...series,
      data: series.data.filter(
        (d) => d.date >= zoomRange.min && d.date <= zoomRange.max,
      ),
    }));
  }, [allData, zoomRange, hiddenSeries]);

  const primaryAxis = useMemo(
    (): AxisOptions<DateDatum> => ({
      getValue: (datum) => datum.date,
      scaleType: "localTime",
      ...(zoomRange ? { min: zoomRange.min, max: zoomRange.max } : {}),
    }),
    [zoomRange],
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

  const seriesColors: Record<string, string> = useMemo(
    () => ({
      [copy.followersLine]: "#38bdf8",
      [copy.followingLine]: "#a78bfa",
    }),
    [],
  );

  const toggleSeries = useCallback((label: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const handleBrushSelect = useCallback(
    (selection: { start: unknown; end: unknown }) => {
      const start = selection.start as Date;
      const end = selection.end as Date;
      if (!start || !end) return;
      const min = start < end ? start : end;
      const max = start < end ? end : start;
      if (max.getTime() - min.getTime() < 1000 * 60 * 60 * 24 * 7) return;
      setZoomRange({ min, max });
    },
    [],
  );

  const handleResetZoom = useCallback(() => setZoomRange(null), []);

  const hasData = allData[0]!.data.length > 0 || allData[1]!.data.length > 0;
  if (!hasData) return null;

  return (
    <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-blue-200/80">
          {copy.title}
        </h3>
        <div className="flex items-center gap-2">
          {zoomRange ? (
            <button
              type="button"
              onClick={handleResetZoom}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-blue-300/80 transition-colors hover:bg-blue-800/40 hover:text-blue-100"
            >
              <ZoomOut className="size-3.5" />
              {copy.resetZoom}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-blue-300/50">
              <ZoomIn className="size-3.5" />
              {copy.dragToZoom}
            </span>
          )}
        </div>
      </div>
      {data.length > 0 ? (
        <div className="h-72 w-full">
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              dark: true,
              defaultColors: data.map((s) => seriesColors[s.label] ?? "#38bdf8"),
              tooltip: {
                groupingMode: "primary",
              },
              brush: {
                onSelect: handleBrushSelect,
                style: {
                  fill: "rgba(56, 189, 248, 0.12)",
                  stroke: "rgba(56, 189, 248, 0.4)",
                  strokeWidth: 1,
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center text-sm text-blue-300/50">
          {copy.allHidden}
        </div>
      )}
      <div className="mt-3 flex items-center justify-center gap-4">
        {allData.map((series) => {
          const hidden = hiddenSeries.has(series.label);
          const color = seriesColors[series.label] ?? "#38bdf8";
          return (
            <button
              key={series.label}
              type="button"
              onClick={() => toggleSeries(series.label)}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-blue-800/30 ${
                hidden ? "text-blue-400/35" : "text-blue-100"
              }`}
            >
              <span
                className="inline-block size-2.5 rounded-full transition-opacity"
                style={{
                  backgroundColor: color,
                  opacity: hidden ? 0.25 : 1,
                }}
              />
              {series.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

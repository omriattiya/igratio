"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";
import { TrendingUp, ZoomIn, ZoomOut } from "lucide-react";
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

function accumulate(data: DateDatum[]): DateDatum[] {
  let total = 0;
  return data.map((d) => {
    total += d.count;
    return { date: d.date, count: total };
  });
}

function lerp(t: number, min: Date, max: Date): Date {
  return new Date(min.getTime() + t * (max.getTime() - min.getTime()));
}

const copy = messages.chart;

export function FollowActivityChart({
  followerTimestamps,
  followingTimestamps,
}: FollowActivityChartProps) {
  const [zoomRange, setZoomRange] = useState<DateRange>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [cumulative, setCumulative] = useState(false);

  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allData = useMemo(() => {
    const followersAgg = aggregateByMonth(followerTimestamps);
    const followingAgg = aggregateByMonth(followingTimestamps);
    const followersLabel = cumulative ? copy.followersAccum : copy.followersLine;
    const followingLabel = cumulative ? copy.followingAccum : copy.followingLine;
    return [
      {
        label: followersLabel,
        data: cumulative ? accumulate(followersAgg) : followersAgg,
      },
      {
        label: followingLabel,
        data: cumulative ? accumulate(followingAgg) : followingAgg,
      },
    ];
  }, [followerTimestamps, followingTimestamps, cumulative]);

  const fullTimeRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const series of allData) {
      for (const d of series.data) {
        const t = d.date.getTime();
        if (t < min) min = t;
        if (t > max) max = t;
      }
    }
    if (!isFinite(min) || !isFinite(max)) return null;
    return { min: new Date(min), max: new Date(max) };
  }, [allData]);

  const activeRange = zoomRange ?? fullTimeRange;

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
      [copy.followersAccum]: "#38bdf8",
      [copy.followingAccum]: "#a78bfa",
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

  const handleResetZoom = useCallback(() => setZoomRange(null), []);

  const toggleCumulative = useCallback(() => {
    setCumulative((v) => !v);
    setHiddenSeries(new Set());
  }, []);

  const xFraction = useCallback(
    (clientX: number): number => {
      const el = containerRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const frac = xFraction(e.clientX);
      setDragStart(frac);
      setDragEnd(frac);
    },
    [xFraction],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (dragStart === null) return;
      setDragEnd(xFraction(e.clientX));
    },
    [dragStart, xFraction],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (dragStart === null || dragEnd === null || !activeRange) {
        setDragStart(null);
        setDragEnd(null);
        return;
      }
      const left = Math.min(dragStart, dragEnd);
      const right = Math.max(dragStart, dragEnd);
      setDragStart(null);
      setDragEnd(null);

      if (right - left < 0.03) return;

      const min = lerp(left, activeRange.min, activeRange.max);
      const max = lerp(right, activeRange.min, activeRange.max);
      if (max.getTime() - min.getTime() < 1000 * 60 * 60 * 24 * 7) return;
      setZoomRange({ min, max });
    },
    [dragStart, dragEnd, activeRange],
  );

  const handleClick = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
  }, []);

  const selectionStyle = useMemo(() => {
    if (dragStart === null || dragEnd === null) return null;
    const left = Math.min(dragStart, dragEnd);
    const right = Math.max(dragStart, dragEnd);
    if (right - left < 0.005) return null;
    return {
      left: `${left * 100}%`,
      width: `${(right - left) * 100}%`,
    };
  }, [dragStart, dragEnd]);

  const hasData = allData[0]!.data.length > 0 || allData[1]!.data.length > 0;
  if (!hasData) return null;

  return (
    <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-blue-200/80">
          {copy.title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCumulative}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors hover:bg-blue-800/40 hover:text-blue-100 ${
              cumulative ? "bg-blue-800/50 text-blue-100" : "text-blue-300/60"
            }`}
          >
            <TrendingUp className="size-3.5" />
            {copy.accumulated}
          </button>
          <span className="text-blue-700/60">|</span>
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
        <div
          ref={containerRef}
          className="relative h-72 w-full select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
          style={{ touchAction: "none" }}
        >
          <Chart
            options={{
              data,
              primaryAxis,
              secondaryAxes,
              dark: true,
              defaultColors: data.map(
                (s) => seriesColors[s.label] ?? "#38bdf8",
              ),
              tooltip: {
                groupingMode: "primary",
              },
            }}
          />
          {selectionStyle && (
            <div
              className="pointer-events-none absolute inset-y-0 rounded-sm border border-sky-400/50 bg-sky-400/10"
              style={selectionStyle}
            />
          )}
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

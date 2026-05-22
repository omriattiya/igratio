import { TrendingDown, TrendingUp } from "lucide-react";
import type { InstagramAnalysis } from "@/lib/instagram";
import type { SummaryDiffs } from "@/components/ExportChangePanel";
import { duplicateRowsNote, messages } from "@/lib/i18n";

const summaryStatCardClass =
  "rounded-xl border border-blue-800/60 bg-blue-950/50 p-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-teal-400/40 hover:bg-blue-900/60 hover:shadow-lg hover:shadow-teal-950/30";

function DiffBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 text-xs font-medium tabular-nums ${
        isPositive ? "text-emerald-400" : "text-red-400"
      }`}
    >
      <Icon className="size-3.5" />
      {isPositive ? "+" : ""}
      {value}
    </span>
  );
}

type InstagramAnalysisSummaryProps = {
  analysis: InstagramAnalysis;
  summaryDiffs?: SummaryDiffs | null;
};

export function InstagramAnalysisSummary({ analysis: a, summaryDiffs }: InstagramAnalysisSummaryProps) {
  const copy = messages.summary;
  const ratioLabel =
    a.followersRatio === null
      ? copy.emDash
      : a.followersRatio.toLocaleString(undefined, { maximumFractionDigits: 3, minimumFractionDigits: 0 });

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      <div className={summaryStatCardClass}>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200/70">
          {copy.following}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-blue-50">{a.followingUnique}</p>
        {summaryDiffs && <DiffBadge value={summaryDiffs.followingDiff} />}
        {a.followingCount !== a.followingUnique && (
          <p className="mt-1 text-xs text-amber-400">
            {duplicateRowsNote(
              a.followingCount,
              a.followingCount - a.followingUnique,
              copy
            )}
          </p>
        )}
      </div>
      <div className={summaryStatCardClass}>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200/70">
          {copy.followers}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-blue-50">{a.followersUnique}</p>
        {summaryDiffs && <DiffBadge value={summaryDiffs.followersDiff} />}
        {a.followersCount !== a.followersUnique && (
          <p className="mt-1 text-xs text-amber-400">
            {duplicateRowsNote(a.followersCount, a.followersCount - a.followersUnique, copy)}
          </p>
        )}
      </div>
      <div className={summaryStatCardClass}>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200/70">
          {copy.mutual}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-blue-50">{a.mutuals.length}</p>
        {summaryDiffs && <DiffBadge value={summaryDiffs.mutualDiff} />}
      </div>
      <div className={summaryStatCardClass}>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200/70">
          {copy.netDifference}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-blue-50">
          {a.netDifference > 0 ? "+" : ""}
          {a.netDifference}
        </p>
        <p className="mt-1 text-xs text-blue-200/60">{copy.netDifferenceHint}</p>
      </div>
      <div className={`${summaryStatCardClass} col-span-2 sm:col-span-1`}>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-200/70">
          {copy.followersRatio}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-blue-50">{ratioLabel}</p>
        <p className="mt-1 text-xs text-blue-200/60">{copy.followersRatioHint}</p>
      </div>
    </div>
  );
}

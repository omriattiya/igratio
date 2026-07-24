import type { ReactNode } from "react";
import {
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  Users,
  UserCheck,
  Scale,
} from "lucide-react";
import type { InstagramAnalysis } from "@/lib/instagram";
import type { SummaryDiffs } from "@/components/ExportChangePanel";
import { duplicateRowsNote, messages } from "@/lib/i18n";

const summaryStatCardClass =
  "interactive-lift surface-panel p-4 hover:border-[var(--line-strong)]";

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

function StatIcon({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand)_18%,transparent)] text-[var(--brand)] shadow-[0_0_16px_-4px_color-mix(in_srgb,var(--brand)_55%,transparent)]">
      {children}
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
        <StatIcon>
          <ArrowLeftRight className="size-4" aria-hidden />
        </StatIcon>
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary-readable">
          {copy.following}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text)]">{a.followingUnique}</p>
        {summaryDiffs && <DiffBadge value={summaryDiffs.followingDiff} />}
        {a.followingCount !== a.followingUnique && (
          <p className="mt-1 text-xs text-amber-300">
            {duplicateRowsNote(
              a.followingCount,
              a.followingCount - a.followingUnique,
              copy
            )}
          </p>
        )}
      </div>
      <div className={summaryStatCardClass}>
        <StatIcon>
          <Users className="size-4" aria-hidden />
        </StatIcon>
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary-readable">
          {copy.followers}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text)]">{a.followersUnique}</p>
        {summaryDiffs && <DiffBadge value={summaryDiffs.followersDiff} />}
        {a.followersCount !== a.followersUnique && (
          <p className="mt-1 text-xs text-amber-300">
            {duplicateRowsNote(a.followersCount, a.followersCount - a.followersUnique, copy)}
          </p>
        )}
      </div>
      <div className={summaryStatCardClass}>
        <StatIcon>
          <UserCheck className="size-4" aria-hidden />
        </StatIcon>
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary-readable">
          {copy.mutual}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text)]">{a.mutuals.length}</p>
        {summaryDiffs && <DiffBadge value={summaryDiffs.mutualDiff} />}
      </div>
      <div className={summaryStatCardClass}>
        <StatIcon>
          <TrendingUp className="size-4" aria-hidden />
        </StatIcon>
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary-readable">
          {copy.netDifference}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text)]">
          {a.netDifference > 0 ? "+" : ""}
          {a.netDifference}
        </p>
        <p className="mt-1 text-xs text-tertiary-readable">{copy.netDifferenceHint}</p>
      </div>
      <div className={`${summaryStatCardClass} col-span-2 sm:col-span-1`}>
        <StatIcon>
          <Scale className="size-4" aria-hidden />
        </StatIcon>
        <p className="text-xs font-medium uppercase tracking-wide text-tertiary-readable">
          {copy.followersRatio}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--text)]">{ratioLabel}</p>
        <p className="mt-1 text-xs text-tertiary-readable">{copy.followersRatioHint}</p>
      </div>
    </div>
  );
}

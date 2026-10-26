import type { ReactNode } from "react";
import { Box, Text, ThemeIcon } from "@mantine/core";
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
    <Text
      component="span"
      size="xs"
      fw={500}
      mt={4}
      className={`inline-flex items-center gap-1 tabular-nums ${
        isPositive ? "text-emerald-400" : "text-red-400"
      }`}
    >
      <Icon className="size-3.5" />
      {isPositive ? "+" : ""}
      {value}
    </Text>
  );
}

function StatIcon({ children }: { children: ReactNode }) {
  return (
    <ThemeIcon
      variant="transparent"
      radius="xl"
      size={32}
      mb={8}
      style={{
        background: "color-mix(in srgb, var(--brand) 18%, transparent)",
        color: "var(--brand)",
        boxShadow: "0 0 16px -4px color-mix(in srgb, var(--brand) 55%, transparent)",
      }}
    >
      {children}
    </ThemeIcon>
  );
}

type InstagramAnalysisSummaryProps = {
  analysis: InstagramAnalysis;
  summaryDiffs?: SummaryDiffs | null;
};

export function InstagramAnalysisSummary({
  analysis: a,
  summaryDiffs,
}: InstagramAnalysisSummaryProps) {
  const copy = messages.summary;
  const ratioLabel =
    a.followersRatio === null
      ? copy.emDash
      : a.followersRatio.toLocaleString(undefined, {
          maximumFractionDigits: 3,
          minimumFractionDigits: 0,
        });

  return (
    <Box className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Box className={summaryStatCardClass}>
        <StatIcon>
          <ArrowLeftRight className="size-4" aria-hidden />
        </StatIcon>
        <Text size="xs" fw={500} tt="uppercase" className="tracking-wide text-tertiary-readable">
          {copy.following}
        </Text>
        <Text mt={6} fw={600} className="text-2xl tabular-nums text-[var(--text)]">
          {a.followingUnique}
        </Text>
        {summaryDiffs && <DiffBadge value={summaryDiffs.followingDiff} />}
        {a.followingCount !== a.followingUnique && (
          <Text size="xs" mt={4} c="yellow.3">
            {duplicateRowsNote(a.followingCount, a.followingCount - a.followingUnique, copy)}
          </Text>
        )}
      </Box>
      <Box className={summaryStatCardClass}>
        <StatIcon>
          <Users className="size-4" aria-hidden />
        </StatIcon>
        <Text size="xs" fw={500} tt="uppercase" className="tracking-wide text-tertiary-readable">
          {copy.followers}
        </Text>
        <Text mt={6} fw={600} className="text-2xl tabular-nums text-[var(--text)]">
          {a.followersUnique}
        </Text>
        {summaryDiffs && <DiffBadge value={summaryDiffs.followersDiff} />}
        {a.followersCount !== a.followersUnique && (
          <Text size="xs" mt={4} c="yellow.3">
            {duplicateRowsNote(a.followersCount, a.followersCount - a.followersUnique, copy)}
          </Text>
        )}
      </Box>
      <Box className={summaryStatCardClass}>
        <StatIcon>
          <UserCheck className="size-4" aria-hidden />
        </StatIcon>
        <Text size="xs" fw={500} tt="uppercase" className="tracking-wide text-tertiary-readable">
          {copy.mutual}
        </Text>
        <Text mt={6} fw={600} className="text-2xl tabular-nums text-[var(--text)]">
          {a.mutuals.length}
        </Text>
        {summaryDiffs && <DiffBadge value={summaryDiffs.mutualDiff} />}
      </Box>
      <Box className={summaryStatCardClass}>
        <StatIcon>
          <TrendingUp className="size-4" aria-hidden />
        </StatIcon>
        <Text size="xs" fw={500} tt="uppercase" className="tracking-wide text-tertiary-readable">
          {copy.netDifference}
        </Text>
        <Text mt={6} fw={600} className="text-2xl tabular-nums text-[var(--text)]">
          {a.netDifference > 0 ? "+" : ""}
          {a.netDifference}
        </Text>
        <Text size="xs" mt={4} className="text-tertiary-readable">
          {copy.netDifferenceHint}
        </Text>
      </Box>
      <Box className={`${summaryStatCardClass} col-span-2 sm:col-span-1`}>
        <StatIcon>
          <Scale className="size-4" aria-hidden />
        </StatIcon>
        <Text size="xs" fw={500} tt="uppercase" className="tracking-wide text-tertiary-readable">
          {copy.followersRatio}
        </Text>
        <Text mt={6} fw={600} className="text-2xl tabular-nums text-[var(--text)]">
          {ratioLabel}
        </Text>
        <Text size="xs" mt={4} className="text-tertiary-readable">
          {copy.followersRatioHint}
        </Text>
      </Box>
    </Box>
  );
}

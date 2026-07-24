import type { InstagramAnalysis } from "@/lib/instagram";
import { diffSets } from "@/lib/instagram";

export type SummaryDiffs = {
  followingDiff: number;
  followersDiff: number;
  mutualDiff: number;
};

export type ExportDiff = {
  followingAdded: string[];
  followingRemoved: string[];
  followersAdded: string[];
  followersRemoved: string[];
  /** Still in your following but no longer in your followers since last export. */
  newUnfollowers: string[];
  hadBaseline: boolean;
  summaryDiffs?: SummaryDiffs;
};

export type ExportDiffBaseline = {
  following: readonly string[];
  followers: readonly string[];
  analysis?: Pick<InstagramAnalysis, "followingUnique" | "followersUnique" | "mutuals">;
  /** Prior persisted diff; kept when the new lists are unchanged. */
  exportDiff?: ExportDiff;
};

export function countExportChanges(diff: ExportDiff | null | undefined): number {
  if (!diff?.hadBaseline) return 0;
  return (
    diff.followingAdded.length +
    diff.followingRemoved.length +
    diff.followersAdded.length +
    diff.followersRemoved.length +
    diff.newUnfollowers.length
  );
}

function listsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Diff current unique lists against the last saved snapshot.
 * If lists are unchanged, keeps the previous exportDiff so reload/re-drop
 * does not replace a real A→B diff with an empty "all None" panel.
 */
export function computeExportDiff(
  prev: ExportDiffBaseline | null | undefined,
  followingSet: ReadonlySet<string>,
  followersSet: ReadonlySet<string>,
  analysis: Pick<InstagramAnalysis, "followingUnique" | "followersUnique" | "mutuals">,
  uniqueFollowing: readonly string[],
  uniqueFollowers: readonly string[],
): ExportDiff {
  if (!prev) {
    return {
      followingAdded: [],
      followingRemoved: [],
      followersAdded: [],
      followersRemoved: [],
      newUnfollowers: [],
      hadBaseline: false,
    };
  }

  if (
    listsEqual(prev.following, uniqueFollowing) &&
    listsEqual(prev.followers, uniqueFollowers) &&
    prev.exportDiff?.hadBaseline
  ) {
    return prev.exportDiff;
  }

  const f = diffSets(new Set(prev.following), followingSet);
  const g = diffSets(new Set(prev.followers), followersSet);
  const newUnfollowers = g.removed.filter((u) => followingSet.has(u));
  const summaryDiffs: SummaryDiffs = {
    followingDiff:
      analysis.followingUnique -
      (prev.analysis?.followingUnique ?? new Set(prev.following).size),
    followersDiff:
      analysis.followersUnique -
      (prev.analysis?.followersUnique ?? new Set(prev.followers).size),
    mutualDiff: analysis.mutuals.length - (prev.analysis?.mutuals.length ?? 0),
  };

  return {
    followingAdded: f.added,
    followingRemoved: f.removed,
    followersAdded: g.added,
    followersRemoved: g.removed,
    newUnfollowers,
    hadBaseline: true,
    summaryDiffs,
  };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeFollowingFollowers,
  diffSets,
  extractUsernamesFromInstagramJson,
  extractTimestampedUsersFromInstagramJson,
  readJsonFile,
  type InstagramAnalysis,
  type TimestampedUser,
} from "@/lib/instagram";
import {
  clearAllSiteData,
  getLatestSnapshot,
  getTrackSnapshots,
  setLatestSnapshot,
  setTrackSnapshots,
} from "@/lib/instagramIndexedDb";
import type { ExportDiff, SummaryDiffs } from "@/components/ExportChangePanel";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages } from "@/lib/i18n";

export type LoadState =
  | { status: typeof AnalyzerLoadStatus.Idle }
  | { status: typeof AnalyzerLoadStatus.Loading }
  | { status: typeof AnalyzerLoadStatus.Error; message: string }
  | { status: typeof AnalyzerLoadStatus.Ready; analysis: InstagramAnalysis };

export function syncInputFiles(
  input: HTMLInputElement | null,
  files: FileList | null,
) {
  if (!input) return;
  const dt = new DataTransfer();
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const f = files.item(i);
      if (f) dt.items.add(f);
    }
  }
  input.files = dt.files;
}

export function formatSnapshotSavedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function useAnalyzerState() {
  const [followingFiles, setFollowingFiles] = useState<FileList | null>(null);
  const [followerFiles, setFollowerFiles] = useState<FileList | null>(null);
  const [state, setState] = useState<LoadState>({ status: AnalyzerLoadStatus.Idle });
  const [trackSnapshots, setTrackSnapshotsState] = useState(false);
  const [lastExportDiff, setLastExportDiff] = useState<ExportDiff | null>(null);
  const [lastSnapshotSavedAt, setLastSnapshotSavedAt] = useState<string | null>(null);
  const [indexedDbError, setIndexedDbError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const followerInputRef = useRef<HTMLInputElement>(null);
  const followingInputRef = useRef<HTMLInputElement>(null);
  const [followerTimestamps, setFollowerTimestamps] = useState<TimestampedUser[]>([]);
  const [followingTimestamps, setFollowingTimestamps] = useState<TimestampedUser[]>([]);

  useEffect(() => {
    void (async () => {
      const enabled = await getTrackSnapshots();
      setTrackSnapshotsState(enabled);
      const snap = await getLatestSnapshot();
      if (enabled) {
        setLastSnapshotSavedAt(snap?.savedAt ?? null);
      }
      if (snap) {
        const analysis =
          snap.analysis ??
          (snap.following.length > 0 && snap.followers.length > 0
            ? analyzeFollowingFollowers(snap.following, snap.followers)
            : null);
        if (analysis) {
          setState({ status: AnalyzerLoadStatus.Ready, analysis });
          if (snap.followerTimestamps) setFollowerTimestamps(snap.followerTimestamps);
          if (snap.followingTimestamps) setFollowingTimestamps(snap.followingTimestamps);
        }
      }
    })();
  }, []);

  const markNewFromDiff = useMemo(() => {
    if (!trackSnapshots || !lastExportDiff?.hadBaseline) return null;
    const next = new Set<string>();
    for (const u of lastExportDiff.followingAdded) next.add(u);
    for (const u of lastExportDiff.followersAdded) next.add(u);
    for (const u of lastExportDiff.newUnfollowers) next.add(u);
    return next;
  }, [trackSnapshots, lastExportDiff]);

  const handleTrackToggle = useCallback(async (enabled: boolean) => {
    const previous = trackSnapshots;
    setTrackSnapshotsState(enabled);
    try {
      await setTrackSnapshots(enabled);
      setIndexedDbError(null);
      if (enabled) {
        const snap = await getLatestSnapshot();
        setLastSnapshotSavedAt(snap?.savedAt ?? null);
      } else {
        setLastSnapshotSavedAt(null);
      }
    } catch {
      setTrackSnapshotsState(previous);
      setIndexedDbError(messages.analyzer.indexedDbFailed);
    }
  }, [trackSnapshots]);

  const runAnalysis = useCallback(async () => {
    if (!followingFiles?.length || !followerFiles?.length) {
      setState({
        status: AnalyzerLoadStatus.Error,
        message: messages.analyzer.errors.selectFiles,
      });
      return;
    }

    setState({ status: AnalyzerLoadStatus.Loading });
    setLastExportDiff(null);
    try {
      const followingRaw: string[] = [];
      const followingTs: TimestampedUser[] = [];
      for (let i = 0; i < followingFiles.length; i++) {
        const file = followingFiles.item(i);
        if (!file) continue;
        const json = await readJsonFile(file);
        followingRaw.push(...extractUsernamesFromInstagramJson(json));
        followingTs.push(...extractTimestampedUsersFromInstagramJson(json));
      }

      const followersRaw: string[] = [];
      const followersTs: TimestampedUser[] = [];
      for (let i = 0; i < followerFiles.length; i++) {
        const file = followerFiles.item(i);
        if (!file) continue;
        const json = await readJsonFile(file);
        followersRaw.push(...extractUsernamesFromInstagramJson(json));
        followersTs.push(...extractTimestampedUsersFromInstagramJson(json));
      }

      if (followingRaw.length === 0 || followersRaw.length === 0) {
        setState({
          status: AnalyzerLoadStatus.Error,
          message: messages.analyzer.errors.noUsernames,
        });
        return;
      }

      const analysis = analyzeFollowingFollowers(followingRaw, followersRaw);

      const followingSet = new Set(followingRaw);
      const followersSet = new Set(followersRaw);
      const uniqueFollowing = [...followingSet].sort();
      const uniqueFollowers = [...followersSet].sort();
      const savedAt = new Date().toISOString();

      try {
        let diff: ExportDiff | null = null;
        if (trackSnapshots) {
          const prev = await getLatestSnapshot();
          if (prev) {
            const f = diffSets(new Set(prev.following), followingSet);
            const g = diffSets(new Set(prev.followers), followersSet);
            const newUnfollowers = g.removed.filter((u) => followingSet.has(u));
            const summaryDiffs: SummaryDiffs = {
              followingDiff: analysis.followingUnique - (prev.analysis?.followingUnique ?? new Set(prev.following).size),
              followersDiff: analysis.followersUnique - (prev.analysis?.followersUnique ?? new Set(prev.followers).size),
              mutualDiff: analysis.mutuals.length - (prev.analysis?.mutuals.length ?? 0),
            };
            diff = {
              followingAdded: f.added,
              followingRemoved: f.removed,
              followersAdded: g.added,
              followersRemoved: g.removed,
              newUnfollowers,
              hadBaseline: true,
              summaryDiffs,
            };
          } else {
            diff = {
              followingAdded: [],
              followingRemoved: [],
              followersAdded: [],
              followersRemoved: [],
              newUnfollowers: [],
              hadBaseline: false,
            };
          }
        }

        await setLatestSnapshot({
          following: uniqueFollowing,
          followers: uniqueFollowers,
          savedAt,
          analysis,
          followerTimestamps: followersTs,
          followingTimestamps: followingTs,
        });

        setIndexedDbError(null);
        if (trackSnapshots && diff) {
          setLastExportDiff(diff);
          setLastSnapshotSavedAt(savedAt);
        } else {
          setLastExportDiff(null);
          setLastSnapshotSavedAt(null);
        }
      } catch {
        setIndexedDbError(messages.analyzer.indexedDbFailed);
        setLastExportDiff(null);
      }

      setFollowerTimestamps(followersTs);
      setFollowingTimestamps(followingTs);
      setState({ status: AnalyzerLoadStatus.Ready, analysis });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : messages.analyzer.errors.parseFailed;
      setState({ status: AnalyzerLoadStatus.Error, message });
    }
  }, [followingFiles, followerFiles, trackSnapshots]);

  const handleSwapFiles = useCallback(() => {
    const prevFollowers = followerFiles;
    const prevFollowing = followingFiles;
    setFollowerFiles(prevFollowing);
    setFollowingFiles(prevFollowers);
    syncInputFiles(followerInputRef.current, prevFollowing);
    syncInputFiles(followingInputRef.current, prevFollowers);
  }, [followerFiles, followingFiles]);

  const handleResetAnalysis = useCallback(async () => {
    try {
      await clearAllSiteData();
      setIndexedDbError(null);
    } catch {
      setIndexedDbError(messages.analyzer.indexedDbFailed);
    }
    setFollowingFiles(null);
    setFollowerFiles(null);
    setFollowerTimestamps([]);
    setFollowingTimestamps([]);
    setFileInputKey((k) => k + 1);
    setState({ status: AnalyzerLoadStatus.Idle });
    setTrackSnapshotsState(false);
    setLastExportDiff(null);
    setLastSnapshotSavedAt(null);
  }, []);

  const canAnalyze = Boolean(followingFiles?.length && followerFiles?.length);
  const canSwap = Boolean(followingFiles?.length || followerFiles?.length);

  return {
    state,
    followingFiles,
    followerFiles,
    trackSnapshots,
    lastExportDiff,
    lastSnapshotSavedAt,
    indexedDbError,
    fileInputKey,
    followerInputRef,
    followingInputRef,
    followerTimestamps,
    followingTimestamps,
    markNewFromDiff,
    canAnalyze,
    canSwap,
    setFollowingFiles,
    setFollowerFiles,
    setIndexedDbError,
    handleTrackToggle,
    runAnalysis,
    handleSwapFiles,
    handleResetAnalysis,
  };
}

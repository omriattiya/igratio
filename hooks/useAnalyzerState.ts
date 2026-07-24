"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeFollowingFollowers,
  extractUsernamesFromInstagramJson,
  extractTimestampedUsersFromInstagramJson,
  type InstagramAnalysis,
  type TimestampedUser,
} from "@/lib/instagram";
import { extractFollowGraphFromExportArchive } from "@/lib/exportArchive";
import { computeExportDiff, type ExportDiff } from "@/lib/exportDiff";
import {
  clearAllSiteData,
  getLatestSnapshot,
  getTrackSnapshots,
  setLatestSnapshot,
  setTrackSnapshots,
} from "@/lib/instagramIndexedDb";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages } from "@/lib/i18n";

export type LoadState =
  | { status: typeof AnalyzerLoadStatus.Idle }
  | { status: typeof AnalyzerLoadStatus.Loading }
  | { status: typeof AnalyzerLoadStatus.Error; message: string }
  | { status: typeof AnalyzerLoadStatus.Ready; analysis: InstagramAnalysis };

function parseJsonTexts(texts: string[]): unknown[] {
  return texts.map((text) => JSON.parse(text) as unknown);
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
  const [archiveName, setArchiveName] = useState<string | null>(null);
  const [selectedBasenames, setSelectedBasenames] = useState<string[]>([]);
  const [state, setState] = useState<LoadState>({ status: AnalyzerLoadStatus.Idle });
  const [trackSnapshots, setTrackSnapshotsState] = useState(true);
  const [lastExportDiff, setLastExportDiff] = useState<ExportDiff | null>(null);
  const [lastSnapshotSavedAt, setLastSnapshotSavedAt] = useState<string | null>(null);
  const [indexedDbError, setIndexedDbError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const archiveInputRef = useRef<HTMLInputElement>(null);
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
          if (enabled && snap.exportDiff?.hadBaseline) {
            setLastExportDiff(snap.exportDiff);
          }
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

  const runAnalysisFromArchive = useCallback(async (file: File) => {
    setState({ status: AnalyzerLoadStatus.Loading });
    setLastExportDiff(null);
    setArchiveName(file.name);
    setSelectedBasenames([]);

    try {
      const extracted = await extractFollowGraphFromExportArchive(file);
      setSelectedBasenames(extracted.selectedBasenames);

      let followingJson: unknown[];
      let followersJson: unknown[];
      try {
        followingJson = parseJsonTexts(extracted.followingJsonTexts);
        followersJson = parseJsonTexts(extracted.followersJsonTexts);
      } catch {
        setState({
          status: AnalyzerLoadStatus.Error,
          message: messages.analyzer.errors.parseFailed,
        });
        return;
      }

      const followingRaw: string[] = [];
      const followingTs: TimestampedUser[] = [];
      for (const json of followingJson) {
        followingRaw.push(...extractUsernamesFromInstagramJson(json));
        followingTs.push(...extractTimestampedUsersFromInstagramJson(json));
      }

      const followersRaw: string[] = [];
      const followersTs: TimestampedUser[] = [];
      for (const json of followersJson) {
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
          diff = computeExportDiff(
            prev,
            followingSet,
            followersSet,
            analysis,
            uniqueFollowing,
            uniqueFollowers,
          );
        }

        await setLatestSnapshot({
          following: uniqueFollowing,
          followers: uniqueFollowers,
          savedAt,
          analysis,
          followerTimestamps: followersTs,
          followingTimestamps: followingTs,
          exportDiff: diff?.hadBaseline ? diff : undefined,
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
  }, [trackSnapshots]);

  const handleArchiveChange = useCallback(
    (files: FileList | null) => {
      const file = files?.item(0) ?? null;
      if (!file) {
        setArchiveName(null);
        setSelectedBasenames([]);
        return;
      }
      void runAnalysisFromArchive(file);
    },
    [runAnalysisFromArchive],
  );

  const handleResetAnalysis = useCallback(async () => {
    try {
      await clearAllSiteData();
      await setTrackSnapshots(true);
      setIndexedDbError(null);
    } catch {
      setIndexedDbError(messages.analyzer.indexedDbFailed);
    }
    setArchiveName(null);
    setSelectedBasenames([]);
    setFollowerTimestamps([]);
    setFollowingTimestamps([]);
    setFileInputKey((k) => k + 1);
    setState({ status: AnalyzerLoadStatus.Idle });
    setTrackSnapshotsState(true);
    setLastExportDiff(null);
    setLastSnapshotSavedAt(null);
  }, []);

  const hasArchive = Boolean(archiveName);

  return {
    state,
    archiveName,
    selectedBasenames,
    trackSnapshots,
    lastExportDiff,
    lastSnapshotSavedAt,
    indexedDbError,
    fileInputKey,
    archiveInputRef,
    followerTimestamps,
    followingTimestamps,
    markNewFromDiff,
    hasArchive,
    setIndexedDbError,
    handleTrackToggle,
    handleArchiveChange,
    handleResetAnalysis,
  };
}

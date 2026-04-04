"use client";

import { useCallback, useEffect, useState } from "react";
import {
  analyzeFollowingFollowers,
  diffSets,
  extractUsernamesFromInstagramJson,
  readJsonFile,
  type InstagramAnalysis,
} from "@/lib/instagram";
import {
  getLatestSnapshot,
  getTrackSnapshots,
  setLatestSnapshot,
  setTrackSnapshots,
} from "@/lib/instagramIndexedDb";
import { InstagramAnalysisSummary } from "@/components/InstagramAnalysisSummary";
import { InstagramUserList } from "@/components/InstagramUserList";
import {
  ExportChangeDiff,
  ExportTrackingToggle,
  type ExportDiff,
} from "@/components/ExportChangePanel";
import { UnfollowerReviewList } from "@/components/UnfollowerReviewList";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages } from "@/lib/i18n";

type LoadState =
  | { status: typeof AnalyzerLoadStatus.Idle }
  | { status: typeof AnalyzerLoadStatus.Loading }
  | { status: typeof AnalyzerLoadStatus.Error; message: string }
  | { status: typeof AnalyzerLoadStatus.Ready; analysis: InstagramAnalysis };

export function InstagramAnalyzer() {
  const [followingFiles, setFollowingFiles] = useState<FileList | null>(null);
  const [followerFiles, setFollowerFiles] = useState<FileList | null>(null);
  const [state, setState] = useState<LoadState>({ status: AnalyzerLoadStatus.Idle });
  const [trackSnapshots, setTrackSnapshotsState] = useState(false);
  const [lastExportDiff, setLastExportDiff] = useState<ExportDiff | null>(null);
  const [indexedDbError, setIndexedDbError] = useState<string | null>(null);

  useEffect(() => {
    void getTrackSnapshots().then(setTrackSnapshotsState);
  }, []);

  const handleTrackToggle = useCallback(async (enabled: boolean) => {
    const previous = trackSnapshots;
    setTrackSnapshotsState(enabled);
    try {
      await setTrackSnapshots(enabled);
      setIndexedDbError(null);
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
      for (let i = 0; i < followingFiles.length; i++) {
        const file = followingFiles.item(i);
        if (!file) continue;
        const json = await readJsonFile(file);
        followingRaw.push(...extractUsernamesFromInstagramJson(json));
      }

      const followersRaw: string[] = [];
      for (let i = 0; i < followerFiles.length; i++) {
        const file = followerFiles.item(i);
        if (!file) continue;
        const json = await readJsonFile(file);
        followersRaw.push(...extractUsernamesFromInstagramJson(json));
      }

      if (followingRaw.length === 0 || followersRaw.length === 0) {
        setState({
          status: AnalyzerLoadStatus.Error,
          message: messages.analyzer.errors.noUsernames,
        });
        return;
      }

      const analysis = analyzeFollowingFollowers(followingRaw, followersRaw);

      if (trackSnapshots) {
        try {
          const followingSet = new Set(followingRaw);
          const followersSet = new Set(followersRaw);
          const uniqueFollowing = [...followingSet].sort();
          const uniqueFollowers = [...followersSet].sort();
          const prev = await getLatestSnapshot();
          let diff: ExportDiff;
          if (prev) {
            const f = diffSets(new Set(prev.following), followingSet);
            const g = diffSets(new Set(prev.followers), followersSet);
            diff = {
              followingAdded: f.added,
              followingRemoved: f.removed,
              followersAdded: g.added,
              followersRemoved: g.removed,
              hadBaseline: true,
            };
          } else {
            diff = {
              followingAdded: [],
              followingRemoved: [],
              followersAdded: [],
              followersRemoved: [],
              hadBaseline: false,
            };
          }
          await setLatestSnapshot({
            following: uniqueFollowing,
            followers: uniqueFollowers,
            savedAt: new Date().toISOString(),
          });
          setIndexedDbError(null);
          setLastExportDiff(diff);
        } catch {
          setIndexedDbError(messages.analyzer.indexedDbFailed);
          setLastExportDiff(null);
        }
      } else {
        setLastExportDiff(null);
      }

      setState({ status: AnalyzerLoadStatus.Ready, analysis });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : messages.analyzer.errors.parseFailed;
      setState({ status: AnalyzerLoadStatus.Error, message });
    }
  }, [followingFiles, followerFiles, trackSnapshots]);

  const canAnalyze = Boolean(followingFiles?.length && followerFiles?.length);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="rounded-2xl border border-blue-200/80 bg-white p-6 shadow-sm shadow-blue-950/5 dark:border-blue-800/60 dark:bg-blue-950/50 dark:shadow-none">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-blue-200/75">
          {messages.analyzer.introBeforeCode}{" "}
          <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-950 dark:bg-blue-900/50 dark:text-blue-100">
            {messages.analyzer.pathCode}
          </code>
          {messages.analyzer.introAfterCode}
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-blue-950 dark:text-blue-100">
              {messages.analyzer.followingLabel}
            </span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-800 dark:file:bg-blue-300 dark:file:text-blue-950 dark:hover:file:bg-blue-200"
              onChange={(e) => setFollowingFiles(e.target.files)}
            />
            <span className="text-xs text-slate-500 dark:text-blue-200/55">
              {messages.analyzer.followingHint}
            </span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-blue-950 dark:text-blue-100">
              {messages.analyzer.followersLabel}
            </span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-800 dark:file:bg-blue-300 dark:file:text-blue-950 dark:hover:file:bg-blue-200"
              onChange={(e) => setFollowerFiles(e.target.files)}
            />
            <span className="text-xs text-slate-500 dark:text-blue-200/55">
              {messages.analyzer.followersHint}
            </span>
          </label>
        </div>

        <ExportTrackingToggle
          enabled={trackSnapshots}
          onChange={(next) => void handleTrackToggle(next)}
          disabled={state.status === AnalyzerLoadStatus.Loading}
        />

        <button
          type="button"
          disabled={!canAnalyze || state.status === AnalyzerLoadStatus.Loading}
          onClick={() => void runAnalysis()}
          className="mt-6 w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:enabled:hover:bg-blue-500 sm:w-auto"
        >
          {state.status === AnalyzerLoadStatus.Loading
            ? messages.analyzer.analyzing
            : messages.analyzer.analyze}
        </button>

        {state.status === AnalyzerLoadStatus.Error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {state.message}
          </p>
        )}

        {indexedDbError && state.status !== AnalyzerLoadStatus.Ready && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            {indexedDbError}
          </p>
        )}
      </div>

      {state.status === AnalyzerLoadStatus.Ready && (
        <>
          <InstagramAnalysisSummary analysis={state.analysis} />
          <p className="rounded-xl border border-blue-200/70 bg-blue-50/40 px-4 py-3 text-sm text-slate-600 dark:border-blue-800/50 dark:bg-blue-950/35 dark:text-blue-200/70">
            {messages.analyzer.indexedDbPrivacy}
          </p>
          {trackSnapshots && <ExportChangeDiff diff={lastExportDiff} />}
          {indexedDbError && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              {indexedDbError}
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-3">
            <UnfollowerReviewList
              title={messages.analyzer.lists.dontFollowBack}
              usernames={state.analysis.youFollowTheyDont}
              accent="text-amber-700 dark:text-amber-400"
              onPersistError={(msg) => setIndexedDbError(msg)}
            />
            <InstagramUserList
              title={messages.analyzer.lists.onlyTheyFollow}
              usernames={state.analysis.theyFollowYouDont}
              accent="text-sky-700 dark:text-sky-400"
            />
            <InstagramUserList
              title={messages.analyzer.lists.mutual}
              usernames={state.analysis.mutuals}
              accent="text-emerald-700 dark:text-emerald-400"
            />
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  analyzeFollowingFollowers,
  diffSets,
  extractUsernamesFromInstagramJson,
  readJsonFile,
  type InstagramAnalysis,
} from "@/lib/instagram";
import {
  clearAllSiteData,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages, t } from "@/lib/i18n";

function formatSnapshotSavedAt(iso: string): string {
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
  const [lastSnapshotSavedAt, setLastSnapshotSavedAt] = useState<string | null>(null);
  const [indexedDbError, setIndexedDbError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

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
        }
      }
    })();
  }, []);

  const markNewFromDiff = useMemo(() => {
    if (!trackSnapshots || !lastExportDiff?.hadBaseline) return null;
    const next = new Set<string>();
    for (const u of lastExportDiff.followingAdded) next.add(u);
    for (const u of lastExportDiff.followersAdded) next.add(u);
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
        }

        await setLatestSnapshot({
          following: uniqueFollowing,
          followers: uniqueFollowers,
          savedAt,
          analysis,
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

      setState({ status: AnalyzerLoadStatus.Ready, analysis });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : messages.analyzer.errors.parseFailed;
      setState({ status: AnalyzerLoadStatus.Error, message });
    }
  }, [followingFiles, followerFiles, trackSnapshots]);

  const canAnalyze = Boolean(followingFiles?.length && followerFiles?.length);

  const handleResetAnalysis = useCallback(async () => {
    try {
      await clearAllSiteData();
      setIndexedDbError(null);
    } catch {
      setIndexedDbError(messages.analyzer.indexedDbFailed);
    }
    setFollowingFiles(null);
    setFollowerFiles(null);
    setFileInputKey((k) => k + 1);
    setState({ status: AnalyzerLoadStatus.Idle });
    setTrackSnapshotsState(false);
    setLastExportDiff(null);
    setLastSnapshotSavedAt(null);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="rounded-2xl border border-blue-800/60 bg-blue-950/50 p-6">
        <p className="text-sm leading-relaxed text-blue-200/75">
          {messages.analyzer.introBeforeCode}{" "}
          <code className="rounded bg-blue-900/50 px-1.5 py-0.5 font-mono text-xs text-blue-100">
            {messages.analyzer.pathCode}
          </code>
          {messages.analyzer.introAfterCode}
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="analyzer-following" className="text-foreground">
              {messages.analyzer.followingLabel}
            </Label>
            <Input
              key={`following-${fileInputKey}`}
              id="analyzer-following"
              type="file"
              accept=".json,application/json"
              multiple
              onChange={(e) => setFollowingFiles(e.target.files)}
            />
            <span className="text-xs text-muted-foreground">{messages.analyzer.followingHint}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="analyzer-followers" className="text-foreground">
              {messages.analyzer.followersLabel}
            </Label>
            <Input
              key={`followers-${fileInputKey}`}
              id="analyzer-followers"
              type="file"
              accept=".json,application/json"
              multiple
              onChange={(e) => setFollowerFiles(e.target.files)}
            />
            <span className="text-xs text-muted-foreground">{messages.analyzer.followersHint}</span>
          </div>
        </div>

        <ExportTrackingToggle
          enabled={trackSnapshots}
          onChange={(next) => void handleTrackToggle(next)}
          disabled={state.status === AnalyzerLoadStatus.Loading}
        />

        {trackSnapshots && lastSnapshotSavedAt ? (
          <p className="mt-3 text-xs tabular-nums text-blue-200/65">
            {t(messages.analyzer.exportTracking.lastSaved, {
              date: formatSnapshotSavedAt(lastSnapshotSavedAt),
            })}
          </p>
        ) : null}

        <Tooltip.Provider delay={0}>
          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              size="lg"
              disabled={!canAnalyze || state.status === AnalyzerLoadStatus.Loading}
              onClick={() => void runAnalysis()}
              className="w-full sm:w-auto"
            >
              {state.status === AnalyzerLoadStatus.Loading
                ? messages.analyzer.analyzing
                : messages.analyzer.analyze}
            </Button>
            <div className="self-end sm:self-auto">
              <Tooltip.Root>
                <Tooltip.Trigger
                  type="button"
                  delay={0}
                  disabled={state.status === AnalyzerLoadStatus.Loading}
                  render={(props) => (
                    <Button
                      {...props}
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-auto border-destructive/45 text-destructive hover:bg-destructive/15"
                      aria-label={messages.analyzer.resetAnalysisAriaLabel}
                      onClick={(e) => {
                        props.onClick?.(e);
                        if (!e.defaultPrevented) void handleResetAnalysis();
                      }}
                    >
                      {messages.analyzer.resetAnalysis}
                    </Button>
                  )}
                />
                <Tooltip.Portal>
                  <Tooltip.Positioner side="top" sideOffset={8}>
                    <TooltipPopup>{messages.analyzer.resetAnalysisTooltip}</TooltipPopup>
                  </Tooltip.Positioner>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </div>
        </Tooltip.Provider>

        {state.status === AnalyzerLoadStatus.Error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {indexedDbError && state.status !== AnalyzerLoadStatus.Ready && (
          <Alert
            className="mt-4 border-amber-900/40 bg-amber-950/30 text-amber-100"
            variant="default"
          >
            <AlertDescription className="text-amber-200">
              {indexedDbError}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {state.status === AnalyzerLoadStatus.Ready && (
        <>
          <InstagramAnalysisSummary analysis={state.analysis} />
          <p className="rounded-xl border border-blue-800/50 bg-blue-950/35 px-4 py-3 text-sm text-blue-200/70">
            {messages.analyzer.indexedDbPrivacy}
          </p>
          {trackSnapshots && <ExportChangeDiff diff={lastExportDiff} />}
          {indexedDbError && (
            <Alert
              className="border-amber-900/40 bg-amber-950/30 text-amber-100"
              variant="default"
            >
              <AlertDescription className="text-amber-200">
                {indexedDbError}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 lg:grid-cols-3">
            <UnfollowerReviewList
              title={messages.analyzer.lists.dontFollowBack}
              usernames={state.analysis.youFollowTheyDont}
              accent="text-amber-400"
              onPersistError={(msg) => setIndexedDbError(msg)}
              markNew={markNewFromDiff}
            />
            <InstagramUserList
              title={messages.analyzer.lists.onlyTheyFollow}
              usernames={state.analysis.theyFollowYouDont}
              accent="text-sky-400"
              markNew={markNewFromDiff}
            />
            <InstagramUserList
              title={messages.analyzer.lists.mutual}
              usernames={state.analysis.mutuals}
              accent="text-emerald-400"
              markNew={markNewFromDiff}
            />
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { CircleCheck, Trash2, WandSparkles } from "lucide-react";
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
import { InstagramAnalysisSummary } from "@/components/InstagramAnalysisSummary";
import { InstagramUserList } from "@/components/InstagramUserList";
import {
  ExportChangeDiff,
  ExportTrackingToggle,
  type ExportDiff,
  type SummaryDiffs,
} from "@/components/ExportChangePanel";
import { UnfollowerReviewList } from "@/components/UnfollowerReviewList";
import { FollowActivityChart } from "@/components/FollowActivityChart";
import { InstagramExportTutorial } from "@/components/InstagramExportTutorial";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    setFollowerTimestamps([]);
    setFollowingTimestamps([]);
    setFileInputKey((k) => k + 1);
    setState({ status: AnalyzerLoadStatus.Idle });
    setTrackSnapshotsState(false);
    setLastExportDiff(null);
    setLastSnapshotSavedAt(null);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="rounded-2xl border border-blue-800/60 bg-blue-950/50 p-6">
        <div className="text-sm leading-relaxed text-blue-200/75">
          <InstagramExportTutorial />
          {messages.analyzer.introAfterLink}{" "}
          <code className="rounded bg-blue-900/50 px-1.5 py-0.5 font-mono text-xs text-blue-100">
            {messages.analyzer.pathCode}
          </code>
          {messages.analyzer.introAfterCode}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <JsonFileUploadField
            id="analyzer-following"
            inputKey={fileInputKey}
            label={messages.analyzer.followingLabel}
            hint={messages.analyzer.followingHint}
            hasFiles={Boolean(followingFiles?.length)}
            onChange={(e) => setFollowingFiles(e.target.files)}
          />
          <JsonFileUploadField
            id="analyzer-followers"
            inputKey={fileInputKey}
            label={messages.analyzer.followersLabel}
            hint={messages.analyzer.followersHint}
            hasFiles={Boolean(followerFiles?.length)}
            onChange={(e) => setFollowerFiles(e.target.files)}
          />
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
              <WandSparkles className="size-4" />
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
                      className="w-auto border-destructive/90 text-destructive hover:bg-destructive/15"
                      aria-label={messages.analyzer.resetAnalysisAriaLabel}
                      onClick={(e) => {
                        props.onClick?.(e);
                        if (!e.defaultPrevented) void handleResetAnalysis();
                      }}
                    >
                      <Trash2 className="size-4" />
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
          <InstagramAnalysisSummary analysis={state.analysis} summaryDiffs={lastExportDiff?.summaryDiffs} />
          <FollowActivityChart
            followerTimestamps={followerTimestamps}
            followingTimestamps={followingTimestamps}
          />
          <ul className="list-disc rounded-xl border border-blue-800/50 bg-blue-950/35 px-4 py-3 pl-8 text-sm text-blue-200/70 space-y-1">
            {messages.analyzer.indexedDbPrivacy.map((line: string) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
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
          <div className="grid gap-4 lg:grid-cols-3 lg:h-[32rem]">
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
              userStatus="follower"
              markNew={markNewFromDiff}
            />
            <InstagramUserList
              title={messages.analyzer.lists.mutual}
              usernames={state.analysis.mutuals}
              accent="text-emerald-400"
              userStatus="mutual"
              markNew={markNewFromDiff}
            />
          </div>
        </>
      )}
    </div>
  );
}

type JsonFileUploadFieldProps = {
  id: string;
  inputKey: number;
  label: string;
  hint: string;
  hasFiles: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

function JsonFileUploadField({
  id,
  inputKey,
  label,
  hint,
  hasFiles,
  onChange,
}: JsonFileUploadFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          key={`${id}-${inputKey}`}
          id={id}
          type="file"
          accept=".json,application/json"
          multiple
          onChange={onChange}
          className={cn(
            hasFiles &&
              "border-emerald-500/80 pr-10 outline outline-2 outline-emerald-500/70 -outline-offset-1 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30",
          )}
        />
        {hasFiles ? (
          <CircleCheck
            className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-emerald-400"
            aria-hidden
          />
        ) : null}
      </div>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

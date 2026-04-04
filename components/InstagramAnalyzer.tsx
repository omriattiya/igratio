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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

        <Button
          type="button"
          size="lg"
          disabled={!canAnalyze || state.status === AnalyzerLoadStatus.Loading}
          onClick={() => void runAnalysis()}
          className="mt-6 w-full sm:w-auto"
        >
          {state.status === AnalyzerLoadStatus.Loading
            ? messages.analyzer.analyzing
            : messages.analyzer.analyze}
        </Button>

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
            />
            <InstagramUserList
              title={messages.analyzer.lists.onlyTheyFollow}
              usernames={state.analysis.theyFollowYouDont}
              accent="text-sky-400"
            />
            <InstagramUserList
              title={messages.analyzer.lists.mutual}
              usernames={state.analysis.mutuals}
              accent="text-emerald-400"
            />
          </div>
        </>
      )}
    </div>
  );
}

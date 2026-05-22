"use client";

import { ExportTrackingToggle } from "@/components/ExportChangePanel";
import { InstagramExportTutorial } from "@/components/InstagramExportTutorial";
import { AnalyzerFileUploadSection } from "@/components/AnalyzerFileUploadSection";
import { AnalyzerActions } from "@/components/AnalyzerActions";
import { AnalyzerResults } from "@/components/AnalyzerResults";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages, t } from "@/lib/i18n";
import { formatSnapshotSavedAt, useAnalyzerState } from "@/hooks/useAnalyzerState";

export function InstagramAnalyzer() {
  const {
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
  } = useAnalyzerState();

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

        <AnalyzerFileUploadSection
          state={state}
          fileInputKey={fileInputKey}
          followerInputRef={followerInputRef}
          followingInputRef={followingInputRef}
          followerFiles={followerFiles}
          followingFiles={followingFiles}
          canSwap={canSwap}
          onFollowerChange={(files) => setFollowerFiles(files)}
          onFollowingChange={(files) => setFollowingFiles(files)}
          onSwap={handleSwapFiles}
        />

        <div data-tour="track-changes">
          <ExportTrackingToggle
            enabled={trackSnapshots}
            onChange={(next) => void handleTrackToggle(next)}
            disabled={state.status === AnalyzerLoadStatus.Loading}
          />
        </div>

        {trackSnapshots && lastSnapshotSavedAt ? (
          <p className="mt-3 text-xs tabular-nums text-blue-200/65">
            {t(messages.analyzer.exportTracking.lastSaved, {
              date: formatSnapshotSavedAt(lastSnapshotSavedAt),
            })}
          </p>
        ) : null}

        <AnalyzerActions
          state={state}
          canAnalyze={canAnalyze}
          onAnalyze={() => void runAnalysis()}
          onReset={() => void handleResetAnalysis()}
        />

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
        <AnalyzerResults
          analysis={state.analysis}
          followerTimestamps={followerTimestamps}
          followingTimestamps={followingTimestamps}
          trackSnapshots={trackSnapshots}
          lastExportDiff={lastExportDiff}
          indexedDbError={indexedDbError}
          markNewFromDiff={markNewFromDiff}
          onPersistError={(msg) => setIndexedDbError(msg)}
        />
      )}
    </div>
  );
}

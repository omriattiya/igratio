"use client";

import { ExportTrackingToggle } from "@/components/ExportChangePanel";
import { InstagramExportTutorial } from "@/components/InstagramExportTutorial";
import { ArchiveDropzone } from "@/components/ArchiveDropzone";
import { AnalyzerActions } from "@/components/AnalyzerActions";
import { AnalyzerResults } from "@/components/AnalyzerResults";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages, t } from "@/lib/i18n";
import { formatSnapshotSavedAt, useAnalyzerState } from "@/hooks/useAnalyzerState";

export function InstagramAnalyzer() {
  const {
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
  } = useAnalyzerState();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 self-center">
      <div className="surface-panel relative overflow-hidden" data-tour="analyzer-panel">
        <div className="surface-card-header px-6 py-5">
          <p className="text-sm leading-relaxed text-secondary-readable">
            <InstagramExportTutorial />
            {messages.analyzer.introAfterLink}{" "}
            <code className="rounded border border-[var(--line)] bg-[var(--bg-inset)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-soft)]">
              {messages.analyzer.pathCode}
            </code>
            {messages.analyzer.introAfterCode}
          </p>
        </div>

        <div className="border-b border-[var(--line)] px-6 py-6">
          <ArchiveDropzone
            inputKey={fileInputKey}
            inputRef={archiveInputRef}
            hasArchive={hasArchive}
            archiveName={archiveName}
            selectedBasenames={selectedBasenames}
            isLoading={state.status === AnalyzerLoadStatus.Loading}
            onChange={handleArchiveChange}
          />
        </div>

        <div className="border-b border-[var(--line)] px-6 py-5">
          <div data-tour="track-changes">
            <ExportTrackingToggle
              enabled={trackSnapshots}
              onChange={(next) => void handleTrackToggle(next)}
              disabled={state.status === AnalyzerLoadStatus.Loading}
            />
          </div>

          {trackSnapshots && lastSnapshotSavedAt ? (
            <p className="mt-3 text-xs tabular-nums text-tertiary-readable">
              {t(messages.analyzer.exportTracking.lastSaved, {
                date: formatSnapshotSavedAt(lastSnapshotSavedAt),
              })}
            </p>
          ) : null}
        </div>

        {(hasArchive ||
          state.status === AnalyzerLoadStatus.Ready ||
          state.status === AnalyzerLoadStatus.Error ||
          indexedDbError) && (
          <div className="bg-[color-mix(in_srgb,var(--bg-inset)_55%,transparent)] px-6 py-5">
            <AnalyzerActions
              state={state}
              canReset={hasArchive || state.status === AnalyzerLoadStatus.Ready}
              onReset={() => void handleResetAnalysis()}
            />

            {state.status === AnalyzerLoadStatus.Error && (
              <Alert variant="destructive" className={hasArchive ? "mt-4" : undefined}>
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
        )}
      </div>

      {state.status === AnalyzerLoadStatus.Ready && (
        <div className="results-enter flex flex-col gap-6">
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
        </div>
      )}
    </div>
  );
}

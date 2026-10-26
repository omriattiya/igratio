"use client";

import { Alert, Box, Code, Stack, Text } from "@mantine/core";
import { ExportTrackingToggle } from "@/components/ExportChangePanel";
import { InstagramExportTutorial } from "@/components/InstagramExportTutorial";
import { ArchiveDropzone } from "@/components/ArchiveDropzone";
import { AnalyzerResults } from "@/components/AnalyzerResults";
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
    followerTimestamps,
    followingTimestamps,
    markNewFromDiff,
    hasArchive,
    setIndexedDbError,
    handleTrackToggle,
    handleArchiveChange,
  } = useAnalyzerState();

  const showAlerts =
    state.status === AnalyzerLoadStatus.Error ||
    Boolean(indexedDbError && state.status !== AnalyzerLoadStatus.Ready);

  return (
    <Stack gap="lg" className="mx-auto w-full max-w-4xl self-center">
      <Box className="surface-panel relative overflow-hidden" data-tour="analyzer-panel">
        <Box className="surface-card-header px-6 py-5">
          <Text component="div" size="sm" lh={1.6} className="text-secondary-readable">
            <InstagramExportTutorial />
            {messages.analyzer.introAfterLink}{" "}
            <Code
              c="var(--text-soft)"
              bg="var(--bg-inset)"
              className="border border-[var(--line)] font-mono text-xs"
            >
              {messages.analyzer.pathCode}
            </Code>
            {messages.analyzer.introAfterCode}
          </Text>
        </Box>

        <Box className="border-b border-[var(--line)] px-6 py-6">
          <ArchiveDropzone
            hasArchive={hasArchive}
            archiveName={archiveName}
            selectedBasenames={selectedBasenames}
            isLoading={state.status === AnalyzerLoadStatus.Loading}
            onChange={handleArchiveChange}
          />
        </Box>

        <Box className="border-b border-[var(--line)] px-6 py-5">
          <Box data-tour="track-changes">
            <ExportTrackingToggle
              enabled={trackSnapshots}
              onChange={(next) => void handleTrackToggle(next)}
              disabled={state.status === AnalyzerLoadStatus.Loading}
            />
          </Box>

          {trackSnapshots && lastSnapshotSavedAt ? (
            <Text size="xs" mt="sm" className="tabular-nums text-tertiary-readable">
              {t(messages.analyzer.exportTracking.lastSaved, {
                date: formatSnapshotSavedAt(lastSnapshotSavedAt),
              })}
            </Text>
          ) : null}
        </Box>

        {showAlerts && (
          <Box className="bg-[color-mix(in_srgb,var(--bg-inset)_55%,transparent)] px-6 py-5">
            {state.status === AnalyzerLoadStatus.Error && (
              <Alert color="red">{state.message}</Alert>
            )}

            {indexedDbError && state.status !== AnalyzerLoadStatus.Ready && (
              <Alert color="yellow" mt={state.status === AnalyzerLoadStatus.Error ? "md" : undefined}>
                {indexedDbError}
              </Alert>
            )}
          </Box>
        )}
      </Box>

      {state.status === AnalyzerLoadStatus.Ready && (
        <Stack gap="lg" className="results-enter">
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
        </Stack>
      )}
    </Stack>
  );
}

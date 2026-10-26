import { Alert, Box, List, SimpleGrid } from "@mantine/core";
import type { InstagramAnalysis, TimestampedUser } from "@/lib/instagram";
import type { ExportDiff } from "@/components/ExportChangePanel";
import { InstagramAnalysisSummary } from "@/components/InstagramAnalysisSummary";
import { InstagramUserList } from "@/components/InstagramUserList";
import { ExportChangeDiff } from "@/components/ExportChangePanel";
import { UnfollowerReviewList } from "@/components/UnfollowerReviewList";
import { FollowActivityChart } from "@/components/FollowActivityChart";
import { messages } from "@/lib/i18n";

type AnalyzerResultsProps = {
  analysis: InstagramAnalysis;
  followerTimestamps: TimestampedUser[];
  followingTimestamps: TimestampedUser[];
  trackSnapshots: boolean;
  lastExportDiff: ExportDiff | null;
  indexedDbError: string | null;
  markNewFromDiff: Set<string> | null;
  onPersistError: (msg: string) => void;
};

export function AnalyzerResults({
  analysis,
  followerTimestamps,
  followingTimestamps,
  trackSnapshots,
  lastExportDiff,
  indexedDbError,
  markNewFromDiff,
  onPersistError,
}: AnalyzerResultsProps) {
  return (
    <>
      <InstagramAnalysisSummary analysis={analysis} summaryDiffs={lastExportDiff?.summaryDiffs} />
      <FollowActivityChart
        followerTimestamps={followerTimestamps}
        followingTimestamps={followingTimestamps}
      />
      <Box className="surface-panel" px="md" py="md">
        <List size="sm" spacing={4} className="text-secondary-readable">
          {messages.analyzer.indexedDbPrivacy.map((line: string) => (
            <List.Item key={line}>{line}</List.Item>
          ))}
        </List>
      </Box>
      {trackSnapshots && <ExportChangeDiff diff={lastExportDiff} />}
      {indexedDbError && <Alert color="yellow">{indexedDbError}</Alert>}
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" className="lg:h-[32rem]">
        <UnfollowerReviewList
          title={messages.analyzer.lists.dontFollowBack}
          usernames={analysis.youFollowTheyDont}
          accent="text-amber-400"
          onPersistError={onPersistError}
          markNew={markNewFromDiff}
        />
        <InstagramUserList
          title={messages.analyzer.lists.onlyTheyFollow}
          usernames={analysis.theyFollowYouDont}
          accent="text-sky-400"
          userStatus="follower"
          markNew={markNewFromDiff}
        />
        <InstagramUserList
          title={messages.analyzer.lists.mutual}
          usernames={analysis.mutuals}
          accent="text-emerald-400"
          userStatus="mutual"
          markNew={markNewFromDiff}
        />
      </SimpleGrid>
    </>
  );
}

import type { InstagramAnalysis, TimestampedUser } from "@/lib/instagram";
import type { ExportDiff } from "@/components/ExportChangePanel";
import { InstagramAnalysisSummary } from "@/components/InstagramAnalysisSummary";
import { InstagramUserList } from "@/components/InstagramUserList";
import { ExportChangeDiff } from "@/components/ExportChangePanel";
import { UnfollowerReviewList } from "@/components/UnfollowerReviewList";
import { FollowActivityChart } from "@/components/FollowActivityChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      <div className="surface-panel px-5 py-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-readable">
          {messages.analyzer.indexedDbPrivacy.map((line: string) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
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
      </div>
    </>
  );
}

"use client";

import { Box, SimpleGrid, Stack, Text } from "@mantine/core";
import { UserLinkCard, type UserStatus } from "@/components/UserLinkCard";
import type { ExportDiff, SummaryDiffs } from "@/lib/exportDiff";
import { messages } from "@/lib/i18n";

export type { ExportDiff, SummaryDiffs };

type ExportTrackingToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function ExportTrackingToggle({
  enabled,
  onChange,
  disabled,
}: ExportTrackingToggleProps) {
  const copy = messages.analyzer.exportTracking;

  return (
    <Box className="surface-inset" p="sm">
      <label
        htmlFor="export-tracking-toggle"
        className={`flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          id="export-tracking-toggle"
          type="checkbox"
          className="track-check-input"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        <span className="track-check" aria-hidden="true">
          <svg viewBox="0 0 48 48" className="track-check-svg">
            <circle className="track-check-ring" cx="24" cy="24" r="22" />
            <circle className="track-check-fill" cx="24" cy="24" />
            <path className="track-check-mark" d="M15.5 25.2 22 31.6 34 17.5" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <Text component="span" display="block" size="sm" fw={500}>
            {copy.toggle}
          </Text>
          <Text
            component="span"
            display="block"
            size="sm"
            mt={2}
            lh={1.6}
            className="text-secondary-readable"
          >
            {copy.toggleHint}
          </Text>
        </span>
      </label>
    </Box>
  );
}

type UsernameListProps = {
  label: string;
  usernames: string[];
  userStatus: UserStatus;
};

function UsernameMiniList({ label, usernames, userStatus }: UsernameListProps) {
  const empty = messages.analyzer.exportTracking.emptyList;
  return (
    <Box className="surface-inset" p="sm">
      <Text size="xs" fw={500} tt="uppercase" className="tracking-wide text-tertiary-readable">
        {label}{" "}
        <Text component="span" inherit fw={400} className="tabular-nums">
          ({usernames.length})
        </Text>
      </Text>
      {usernames.length === 0 ? (
        <Text size="sm" mt="xs" className="text-secondary-readable">
          {empty}
        </Text>
      ) : (
        <Stack
          component="ul"
          gap={6}
          mt="xs"
          className="custom-scrollbar max-h-40 list-none overflow-y-auto pr-2"
        >
          {usernames.map((u) => (
            <li key={u}>
              <UserLinkCard username={u} status={userStatus} />
            </li>
          ))}
        </Stack>
      )}
    </Box>
  );
}

type ExportChangeDiffProps = {
  diff: ExportDiff | null;
};

export function ExportChangeDiff({ diff }: ExportChangeDiffProps) {
  const copy = messages.analyzer.exportTracking;

  if (!diff) return null;

  if (!diff.hadBaseline) {
    return (
      <Box className="surface-panel-soft" p="md">
        <Text component="h3" size="sm" fw={600} c="blue.0">
          {copy.sectionTitle}
        </Text>
        <Text size="sm" mt="xs" className="text-secondary-readable">
          {copy.baselineOnly}
        </Text>
      </Box>
    );
  }

  return (
    <Box className="surface-panel-soft" p="md">
      <Text component="h3" size="sm" fw={600} c="blue.0">
        {copy.sectionTitle}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="md">
        <Box className="sm:col-span-2">
          <UsernameMiniList
            label={copy.newUnfollowers}
            usernames={diff.newUnfollowers}
            userStatus="unfollower"
          />
        </Box>
        <UsernameMiniList
          label={copy.followingAdded}
          usernames={diff.followingAdded}
          userStatus="new-follow"
        />
        <UsernameMiniList
          label={copy.followingRemoved}
          usernames={diff.followingRemoved}
          userStatus="removed"
        />
        <UsernameMiniList
          label={copy.followersAdded}
          usernames={diff.followersAdded}
          userStatus="new-follow"
        />
        <UsernameMiniList
          label={copy.followersRemoved}
          usernames={diff.followersRemoved}
          userStatus="removed"
        />
      </SimpleGrid>
    </Box>
  );
}

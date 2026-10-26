"use client";

import { useMemo, useState } from "react";
import { ActionIcon, Box, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { ArrowDownAZ, Sparkles, ArrowUpDown, ChevronDown } from "lucide-react";
import { messages } from "@/lib/i18n";
import { useIsSmallScreen } from "@/lib/useIsSmallScreen";
import { UserLinkCard, type UserStatus } from "@/components/UserLinkCard";

type SortMode = "new-first" | "a-z";

type InstagramUserListProps = {
  title: string;
  usernames: string[];
  accent: string;
  userStatus: UserStatus;
  /** Usernames new since last tracked snapshot (following or followers added). */
  markNew?: Set<string> | null;
};

export function InstagramUserList({
  title,
  usernames,
  accent,
  userStatus,
  markNew,
}: InstagramUserListProps) {
  const [sort, setSort] = useState<SortMode>("new-first");
  const [expanded, setExpanded] = useState(false);
  const isSmallScreen = useIsSmallScreen();

  const sorted = useMemo(() => {
    if (sort === "a-z") {
      return [...usernames].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
    }
    if (markNew && markNew.size > 0) {
      return [...usernames].sort((a, b) => {
        const aNew = markNew.has(a) ? 0 : 1;
        const bNew = markNew.has(b) ? 0 : 1;
        return aNew - bNew;
      });
    }
    return usernames;
  }, [usernames, sort, markNew]);

  if (usernames.length === 0) {
    return (
      <Box component="section" className="surface-panel-soft flex h-full flex-col" p="md">
        <Text component="h3" size="sm" fw={600} className={accent}>
          {title}
        </Text>
        <Text size="sm" mt="xs" className="text-secondary-readable">
          {messages.userList.empty}
        </Text>
      </Box>
    );
  }

  const collapsed = isSmallScreen && !expanded;

  return (
    <Box component="section" className="surface-panel-soft flex h-full flex-col" p="md">
      <Group justify="space-between" wrap="nowrap">
        <UnstyledButton
          type="button"
          className="flex items-center gap-2 lg:pointer-events-none"
          onClick={() => isSmallScreen && setExpanded((v) => !v)}
        >
          <Text component="h3" size="sm" fw={600} className={accent}>
            {title}{" "}
            <Text component="span" inherit fw={400} className="text-tertiary-readable">
              ({usernames.length})
            </Text>
          </Text>
          <ChevronDown
            className={`size-4 text-blue-200/80 transition-transform duration-200 [transition-timing-function:var(--ease-out-expo)] lg:hidden ${expanded ? "rotate-180" : ""}`}
          />
        </UnstyledButton>

        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" aria-label="Sort options">
              <ArrowUpDown className="size-4" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<ArrowDownAZ className="size-4" />}
              onClick={() => setSort("a-z")}
              c={sort === "a-z" ? "var(--text)" : "var(--text-soft)"}
            >
              A–Z
            </Menu.Item>
            <Menu.Item
              leftSection={<Sparkles className="size-4" />}
              onClick={() => setSort("new-first")}
              c={sort === "new-first" ? "var(--text)" : "var(--text-soft)"}
            >
              New first
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {!collapsed && (
        <Box
          component="ul"
          className="custom-scrollbar mt-3 max-h-[70vh] list-none space-y-2 overflow-y-auto pr-2 lg:max-h-none lg:min-h-0 lg:flex-1 lg:basis-0"
        >
          {sorted.map((u) => (
            <li key={u}>
              <UserLinkCard username={u} status={userStatus} isNew={markNew?.has(u)} />
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
}

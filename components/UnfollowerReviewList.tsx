"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionIcon, Box, Checkbox, Group, Menu, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { ArrowDownAZ, ArrowUpDown, ChevronDown, CircleDashed, Info, Sparkles } from "lucide-react";
import {
  getUnfollowerOkSet,
  pruneUnfollowerOk,
  setUnfollowerOk,
} from "@/lib/instagramIndexedDb";
import { UserLinkCard } from "@/components/UserLinkCard";
import { messages } from "@/lib/i18n";
import { useIsSmallScreen } from "@/lib/useIsSmallScreen";

type SortMode = "new-first" | "a-z" | "pending-first";

type UnfollowerReviewListProps = {
  usernames: string[];
  accent: string;
  title: string;
  onPersistError?: (message: string) => void;
  markNew?: Set<string> | null;
};

export function UnfollowerReviewList({
  usernames,
  accent,
  title,
  onPersistError,
  markNew,
}: UnfollowerReviewListProps) {
  const [okSet, setOkSet] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortMode>("new-first");
  const [expanded, setExpanded] = useState(false);
  const onPersistErrorRef = useRef(onPersistError);
  const isSmallScreen = useIsSmallScreen();

  useEffect(() => {
    onPersistErrorRef.current = onPersistError;
  });

  useEffect(() => {
    const valid = new Set(usernames);
    let cancelled = false;
    void (async () => {
      try {
        await pruneUnfollowerOk(valid);
        const next = await getUnfollowerOkSet();
        if (!cancelled) setOkSet(next);
      } catch (e) {
        onPersistErrorRef.current?.(
          e instanceof Error ? e.message : messages.analyzer.errors.parseFailed,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [usernames]);

  const toggleOk = useCallback(async (username: string, ok: boolean) => {
    setOkSet((prev) => {
      const next = new Set(prev);
      if (ok) next.add(username);
      else next.delete(username);
      return next;
    });
    try {
      await setUnfollowerOk(username, ok);
    } catch (e) {
      setOkSet((prev) => {
        const next = new Set(prev);
        if (ok) next.delete(username);
        else next.add(username);
        return next;
      });
      onPersistErrorRef.current?.(
        e instanceof Error ? e.message : messages.analyzer.errors.parseFailed,
      );
    }
  }, []);

  const sorted = useMemo(() => {
    if (sort === "a-z") {
      return [...usernames].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
    }
    if (sort === "pending-first") {
      return [...usernames].sort((a, b) => {
        const aOk = okSet.has(a) ? 1 : 0;
        const bOk = okSet.has(b) ? 1 : 0;
        return aOk - bOk;
      });
    }
    if (markNew && markNew.size > 0) {
      return [...usernames].sort((a, b) => {
        const aNew = markNew.has(a) ? 0 : 1;
        const bNew = markNew.has(b) ? 0 : 1;
        return aNew - bNew;
      });
    }
    return usernames;
  }, [usernames, sort, markNew, okSet]);

  const copy = messages.analyzer.unfollowers;

  if (usernames.length === 0) {
    return (
      <Box component="section" className="surface-panel-soft" p="md">
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
        <Group gap="xs" wrap="nowrap">
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
          <Tooltip label={copy.manageHint} position="top">
            <ActionIcon
              variant="transparent"
              color="gray"
              size="sm"
              aria-label={copy.manageHint}
              className="text-blue-200/70 hover:text-blue-50"
            >
              <Info className="size-4" />
            </ActionIcon>
          </Tooltip>
        </Group>

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
            <Menu.Item
              leftSection={<CircleDashed className="size-4" />}
              onClick={() => setSort("pending-first")}
              c={sort === "pending-first" ? "var(--text)" : "var(--text-soft)"}
            >
              Pending first
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {!collapsed && (
        <Box
          component="ul"
          className="custom-scrollbar mt-3 max-h-[70vh] list-none space-y-2 overflow-y-auto pr-2 lg:max-h-none lg:min-h-0 lg:flex-1 lg:basis-0"
        >
          {sorted.map((u) => {
            const isOk = okSet.has(u);
            return (
              <li key={u}>
                <UserLinkCard
                  username={u}
                  status={isOk ? "checked" : "unfollower"}
                  isNew={markNew?.has(u)}
                  dimmed={isOk}
                >
                  <Checkbox
                    checked={isOk}
                    onChange={(event) => void toggleOk(u, event.currentTarget.checked)}
                    aria-label={`${copy.okCheckbox}: ${u}`}
                    size="xs"
                  />
                </UserLinkCard>
              </li>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

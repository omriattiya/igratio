"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownAZ, ArrowUpDown, ChevronDown, Info, Sparkles } from "lucide-react";
import {
  getUnfollowerOkSet,
  pruneUnfollowerOk,
  setUnfollowerOk,
} from "@/lib/instagramIndexedDb";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip";
import { UserLinkCard } from "@/components/UserLinkCard";
import { messages } from "@/lib/i18n";
import { useIsSmallScreen } from "@/lib/useIsSmallScreen";

type SortMode = "new-first" | "a-z";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const onPersistErrorRef = useRef(onPersistError);
  const isSmallScreen = useIsSmallScreen();

  useEffect(() => {
    onPersistErrorRef.current = onPersistError;
  });

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

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
    if (markNew && markNew.size > 0) {
      return [...usernames].sort((a, b) => {
        const aNew = markNew.has(a) ? 0 : 1;
        const bNew = markNew.has(b) ? 0 : 1;
        return aNew - bNew;
      });
    }
    return usernames;
  }, [usernames, sort, markNew]);

  const copy = messages.analyzer.unfollowers;

  if (usernames.length === 0) {
    return (
      <section className="rounded-xl border border-blue-800/30 bg-blue-950/35 p-4">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-2 text-sm text-blue-200/65">
          {messages.userList.empty}
        </p>
      </section>
    );
  }

  const collapsed = isSmallScreen && !expanded;

  return (
    <section className="flex h-full flex-col rounded-xl border border-blue-800/30 bg-blue-950/35 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 lg:pointer-events-none"
            onClick={() => isSmallScreen && setExpanded((v) => !v)}
          >
            <h3 className={`text-sm font-semibold ${accent}`}>
              {title}{" "}
              <span className="font-normal text-blue-200/60">({usernames.length})</span>
            </h3>
            <ChevronDown
              className={`size-4 text-blue-300/70 transition-transform lg:hidden ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <Tooltip.Provider delay={0}>
            <Tooltip.Root>
              <Tooltip.Trigger
                className="inline-flex cursor-default text-blue-300/50 transition-colors hover:text-blue-200/80"
              >
                <Info className="size-4" />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={6}>
                  <TooltipPopup>{copy.manageHint}</TooltipPopup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-blue-300/70 transition-colors hover:bg-blue-800/40 hover:text-blue-200"
            aria-label="Sort options"
          >
            <ArrowUpDown className="size-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-blue-700/60 bg-blue-950 shadow-xl shadow-black/40">
              <button
                type="button"
                onClick={() => { setSort("a-z"); setMenuOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-800/50 ${sort === "a-z" ? "text-blue-100" : "text-blue-300/80"}`}
              >
                <ArrowDownAZ className="size-4" />
                A–Z
              </button>
              <button
                type="button"
                onClick={() => { setSort("new-first"); setMenuOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-800/50 ${sort === "new-first" ? "text-blue-100" : "text-blue-300/80"}`}
              >
                <Sparkles className="size-4" />
                New first
              </button>
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <ul className="custom-scrollbar mt-3 max-h-[70vh] list-none space-y-2 overflow-y-auto pr-2 lg:max-h-none lg:min-h-0 lg:flex-1 lg:basis-0">
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
                    onCheckedChange={(checked) =>
                      void toggleOk(u, checked === true)
                    }
                    aria-label={`${copy.okCheckbox}: ${u}`}
                  />
                </UserLinkCard>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

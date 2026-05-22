"use client";

import { useMemo, useRef, useState, useEffect } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = useIsSmallScreen();

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
      <section className="flex h-full flex-col rounded-xl border border-blue-800/30 bg-blue-950/35 p-4">
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
        <button
          type="button"
          className="flex items-center gap-2 lg:pointer-events-none"
          onClick={() => isSmallScreen && setExpanded((v) => !v)}
        >
          <h3 className={`text-sm font-semibold ${accent}`}>
            {title}{" "}
            <span className="font-normal text-blue-200/60">
              ({usernames.length})
            </span>
          </h3>
          <ChevronDown
            className={`size-4 text-blue-300/70 transition-transform lg:hidden ${expanded ? "rotate-180" : ""}`}
          />
        </button>

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
          {sorted.map((u) => (
            <li key={u}>
              <UserLinkCard
                username={u}
                status={userStatus}
                isNew={markNew?.has(u)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

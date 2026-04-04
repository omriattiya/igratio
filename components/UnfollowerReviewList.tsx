"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getUnfollowerOkSet,
  pruneUnfollowerOk,
  setUnfollowerOk,
} from "@/lib/instagramIndexedDb";
import { Checkbox } from "@/components/ui/checkbox";
import { messages } from "@/lib/i18n";

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
  const onPersistErrorRef = useRef(onPersistError);

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

  const copy = messages.analyzer.unfollowers;

  if (usernames.length === 0) {
    return (
      <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-2 text-sm text-blue-200/60">
          {messages.userList.empty}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <h3 className={`text-sm font-semibold ${accent}`}>
        {title}{" "}
        <span className="font-normal text-blue-200/60">({usernames.length})</span>
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-blue-200/55">
        {copy.manageHint}
      </p>
      <ul className="mt-3 max-h-64 list-none space-y-2 overflow-y-auto text-sm text-blue-100/90">
        {usernames.map((u) => (
          <li key={u} className="flex items-start gap-2 break-all">
            <Checkbox
              checked={okSet.has(u)}
              onCheckedChange={(checked) => void toggleOk(u, checked === true)}
              aria-label={`${copy.okCheckbox}: ${u}`}
              className="mt-1"
            />
            <a
              href={`https://www.instagram.com/${u}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-w-0 text-blue-300 underline-offset-2 hover:underline ${okSet.has(u) ? "opacity-70" : ""}`}
            >
              {u}
            </a>
            {markNew?.has(u) ? (
              <span
                className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
                aria-label={messages.userList.newBadge}
              >
                {messages.userList.newBadge}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

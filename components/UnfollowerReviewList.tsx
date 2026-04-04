"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getUnfollowerOkSet,
  pruneUnfollowerOk,
  setUnfollowerOk,
} from "@/lib/instagramIndexedDb";
import { messages } from "@/lib/i18n";

type UnfollowerReviewListProps = {
  usernames: string[];
  accent: string;
  title: string;
  onPersistError?: (message: string) => void;
};

export function UnfollowerReviewList({
  usernames,
  accent,
  title,
  onPersistError,
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
      <section className="rounded-xl border border-blue-200/70 bg-white/60 p-4 dark:border-blue-800/50 dark:bg-blue-950/40">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-blue-200/60">
          {messages.userList.empty}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-blue-200/70 bg-white/60 p-4 dark:border-blue-800/50 dark:bg-blue-950/40">
      <h3 className={`text-sm font-semibold ${accent}`}>
        {title}{" "}
        <span className="font-normal text-slate-500 dark:text-blue-200/60">({usernames.length})</span>
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-blue-200/55">
        {copy.manageHint}
      </p>
      <ul className="mt-3 max-h-64 list-none space-y-2 overflow-y-auto text-sm text-slate-800 dark:text-blue-100/90">
        {usernames.map((u) => (
          <li key={u} className="flex items-start gap-2 break-all">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={okSet.has(u)}
                onChange={(e) => void toggleOk(u, e.target.checked)}
                aria-label={`${copy.okCheckbox}: ${u}`}
                className="mt-1 size-4 shrink-0 rounded border-slate-300 text-blue-900 focus:ring-blue-900 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-300"
              />
            </label>
            <a
              href={`https://www.instagram.com/${u}/`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-700 underline-offset-2 hover:underline dark:text-blue-300 ${okSet.has(u) ? "opacity-70" : ""}`}
            >
              {u}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

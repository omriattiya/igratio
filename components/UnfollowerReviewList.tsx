"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getUnfollowerOkSet,
  pruneUnfollowerOk,
  setUnfollowerOk,
} from "@/lib/instagramIndexedDb";
import { Checkbox } from "@/components/ui/checkbox";
import { UserLinkCard } from "@/components/UserLinkCard";
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
    <section className="flex h-full flex-col rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <h3 className={`text-sm font-semibold ${accent}`}>
        {title}{" "}
        <span className="font-normal text-blue-200/60">({usernames.length})</span>
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-blue-200/55">
        {copy.manageHint}
      </p>
      <ul className="mt-3 min-h-0 flex-1 basis-0 list-none space-y-2 overflow-y-auto">
        {usernames.map((u) => {
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
    </section>
  );
}

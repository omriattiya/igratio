"use client";

import { useCallback, useState } from "react";
import {
  analyzeFollowingFollowers,
  extractUsernamesFromInstagramJson,
  readJsonFile,
  type InstagramAnalysis,
} from "@/lib/instagram";
import { InstagramAnalysisSummary } from "@/components/InstagramAnalysisSummary";
import { InstagramUserList } from "@/components/InstagramUserList";
import { messages } from "@/lib/i18n";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; analysis: InstagramAnalysis };

export function InstagramAnalyzer() {
  const [followingFiles, setFollowingFiles] = useState<FileList | null>(null);
  const [followerFiles, setFollowerFiles] = useState<FileList | null>(null);
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const runAnalysis = useCallback(async () => {
    if (!followingFiles?.length || !followerFiles?.length) {
      setState({
        status: "error",
        message: messages.analyzer.errors.selectFiles,
      });
      return;
    }

    setState({ status: "loading" });
    try {
      const followingRaw: string[] = [];
      for (let i = 0; i < followingFiles.length; i++) {
        const file = followingFiles.item(i);
        if (!file) continue;
        const json = await readJsonFile(file);
        followingRaw.push(...extractUsernamesFromInstagramJson(json));
      }

      const followersRaw: string[] = [];
      for (let i = 0; i < followerFiles.length; i++) {
        const file = followerFiles.item(i);
        if (!file) continue;
        const json = await readJsonFile(file);
        followersRaw.push(...extractUsernamesFromInstagramJson(json));
      }

      if (followingRaw.length === 0 || followersRaw.length === 0) {
        setState({
          status: "error",
          message: messages.analyzer.errors.noUsernames,
        });
        return;
      }

      const analysis = analyzeFollowingFollowers(followingRaw, followersRaw);
      setState({ status: "ready", analysis });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : messages.analyzer.errors.parseFailed;
      setState({ status: "error", message });
    }
  }, [followingFiles, followerFiles]);

  const canAnalyze = Boolean(followingFiles?.length && followerFiles?.length);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="rounded-2xl border border-blue-200/80 bg-white p-6 shadow-sm shadow-blue-950/5 dark:border-blue-800/60 dark:bg-blue-950/50 dark:shadow-none">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-blue-200/75">
          {messages.analyzer.introBeforeCode}{" "}
          <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-950 dark:bg-blue-900/50 dark:text-blue-100">
            {messages.analyzer.pathCode}
          </code>
          {messages.analyzer.introAfterCode}
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-blue-950 dark:text-blue-100">
              {messages.analyzer.followingLabel}
            </span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-800 dark:file:bg-blue-300 dark:file:text-blue-950 dark:hover:file:bg-blue-200"
              onChange={(e) => setFollowingFiles(e.target.files)}
            />
            <span className="text-xs text-slate-500 dark:text-blue-200/55">
              {messages.analyzer.followingHint}
            </span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-blue-950 dark:text-blue-100">
              {messages.analyzer.followersLabel}
            </span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-800 dark:file:bg-blue-300 dark:file:text-blue-950 dark:hover:file:bg-blue-200"
              onChange={(e) => setFollowerFiles(e.target.files)}
            />
            <span className="text-xs text-slate-500 dark:text-blue-200/55">
              {messages.analyzer.followersHint}
            </span>
          </label>
        </div>

        <button
          type="button"
          disabled={!canAnalyze || state.status === "loading"}
          onClick={() => void runAnalysis()}
          className="mt-6 w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:enabled:hover:bg-blue-500 sm:w-auto"
        >
          {state.status === "loading" ? messages.analyzer.analyzing : messages.analyzer.analyze}
        </button>

        {state.status === "error" && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {state.message}
          </p>
        )}
      </div>

      {state.status === "ready" && <InstagramAnalysisSummary analysis={state.analysis} />}

      {state.status === "ready" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <InstagramUserList
            title={messages.analyzer.lists.dontFollowBack}
            usernames={state.analysis.youFollowTheyDont}
            accent="text-amber-700 dark:text-amber-400"
          />
          <InstagramUserList
            title={messages.analyzer.lists.onlyTheyFollow}
            usernames={state.analysis.theyFollowYouDont}
            accent="text-sky-700 dark:text-sky-400"
          />
          <InstagramUserList
            title={messages.analyzer.lists.mutual}
            usernames={state.analysis.mutuals}
            accent="text-emerald-700 dark:text-emerald-400"
          />
        </div>
      )}
    </div>
  );
}

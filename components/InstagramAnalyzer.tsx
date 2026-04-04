"use client";

import { useCallback, useMemo, useState } from "react";
import {
  analyzeFollowingFollowers,
  extractUsernamesFromInstagramJson,
  readJsonFile,
  type InstagramAnalysis,
} from "@/lib/instagram";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; analysis: InstagramAnalysis };

function UserList({ title, usernames, accent }: { title: string; usernames: string[]; accent: string }) {
  if (usernames.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No accounts in this category.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h3 className={`text-sm font-semibold ${accent}`}>
        {title}{" "}
        <span className="font-normal text-zinc-500 dark:text-zinc-400">({usernames.length})</span>
      </h3>
      <ul className="mt-3 max-h-64 list-inside list-disc overflow-y-auto text-sm text-zinc-800 dark:text-zinc-200">
        {usernames.map((u) => (
          <li key={u} className="break-all">
            @{u}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function InstagramAnalyzer() {
  const [followingFiles, setFollowingFiles] = useState<FileList | null>(null);
  const [followerFiles, setFollowerFiles] = useState<FileList | null>(null);
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const runAnalysis = useCallback(async () => {
    if (!followingFiles?.length || !followerFiles?.length) {
      setState({
        status: "error",
        message: "Select at least one following JSON and one followers JSON file.",
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
          message:
            "No usernames were found. Use the JSON files from Instagram → Settings → Download your information → followers_*.json and following.json (or equivalent).",
        });
        return;
      }

      const analysis = analyzeFollowingFollowers(followingRaw, followersRaw);
      setState({ status: "ready", analysis });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to read or parse JSON.";
      setState({ status: "error", message });
    }
  }, [followingFiles, followerFiles]);

  const canAnalyze = Boolean(followingFiles?.length && followerFiles?.length);

  const summary = useMemo(() => {
    if (state.status !== "ready") return null;
    const a = state.analysis;
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Following</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{a.followingUnique}</p>
          {a.followingCount !== a.followingUnique && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {a.followingCount} rows ({a.followingCount - a.followingUnique} duplicate
              {a.followingCount - a.followingUnique === 1 ? "" : "s"})
            </p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Followers</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{a.followersUnique}</p>
          {a.followersCount !== a.followersUnique && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {a.followersCount} rows ({a.followersCount - a.followersUnique} duplicate
              {a.followersCount - a.followersUnique === 1 ? "" : "s"})
            </p>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Mutual</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{a.mutuals.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Net difference</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {a.youFollowTheyDont.length - a.theyFollowYouDont.length >= 0 ? "+" : ""}
            {a.youFollowTheyDont.length - a.theyFollowYouDont.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Following minus one-way followers</p>
        </div>
      </div>
    );
  }, [state]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Export your data from the Instagram app or website (Settings → Accounts Center → Your information and
          permissions → Download your information). Unzip the archive and choose the JSON files under{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-900">
            connections/followers_and_following/
          </code>
          . Everything below runs in your browser; files are not uploaded.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Following JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900"
              onChange={(e) => setFollowingFiles(e.target.files)}
            />
            <span className="text-xs text-zinc-500">Usually following.json. Multiple files are merged.</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Followers JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              multiple
              className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900"
              onChange={(e) => setFollowerFiles(e.target.files)}
            />
            <span className="text-xs text-zinc-500">followers_1.json, followers_2.json, …</span>
          </label>
        </div>

        <button
          type="button"
          disabled={!canAnalyze || state.status === "loading"}
          onClick={() => void runAnalysis()}
          className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-200 sm:w-auto"
        >
          {state.status === "loading" ? "Analyzing…" : "Analyze"}
        </button>

        {state.status === "error" && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {state.message}
          </p>
        )}
      </div>

      {summary}

      {state.status === "ready" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <UserList
            title="You follow, they don’t follow back"
            usernames={state.analysis.youFollowTheyDont}
            accent="text-amber-700 dark:text-amber-400"
          />
          <UserList
            title="They follow you, you don’t follow back"
            usernames={state.analysis.theyFollowYouDont}
            accent="text-sky-700 dark:text-sky-400"
          />
          <UserList title="Mutual" usernames={state.analysis.mutuals} accent="text-emerald-700 dark:text-emerald-400" />
        </div>
      )}
    </div>
  );
}

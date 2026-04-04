"use client";

import { messages } from "@/lib/i18n";

export type ExportDiff = {
  followingAdded: string[];
  followingRemoved: string[];
  followersAdded: string[];
  followersRemoved: string[];
  hadBaseline: boolean;
};

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
    <div className="mt-6 rounded-xl border border-blue-200/70 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-950/30">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.checked;
            onChange(next);
          }}
          className="mt-1 size-4 shrink-0 rounded border-slate-300 text-blue-900 focus:ring-blue-900 disabled:opacity-50 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-300"
        />
        <span className="flex flex-col gap-1">
          <span className="text-sm font-medium text-blue-950 dark:text-blue-100">{copy.toggle}</span>
          <span className="text-xs leading-relaxed text-slate-600 dark:text-blue-200/65">
            {copy.toggleHint}
          </span>
        </span>
      </label>
    </div>
  );
}

type UsernameListProps = {
  label: string;
  usernames: string[];
};

function UsernameMiniList({ label, usernames }: UsernameListProps) {
  const empty = messages.analyzer.exportTracking.emptyList;
  return (
    <div className="rounded-lg border border-blue-200/60 bg-white/80 p-3 dark:border-blue-800/40 dark:bg-blue-950/50">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-blue-200/60">
        {label}{" "}
        <span className="font-normal tabular-nums">({usernames.length})</span>
      </p>
      {usernames.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-blue-200/55">{empty}</p>
      ) : (
        <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto text-sm text-slate-800 dark:text-blue-100/90">
          {usernames.map((u) => (
            <li key={u} className="break-all">
              <a
                href={`https://www.instagram.com/${u}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
              >
                {u}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
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
      <div className="rounded-xl border border-blue-200/70 bg-white/60 p-4 dark:border-blue-800/50 dark:bg-blue-950/40">
        <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">{copy.sectionTitle}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-blue-200/70">{copy.baselineOnly}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200/70 bg-white/60 p-4 dark:border-blue-800/50 dark:bg-blue-950/40">
      <h3 className="text-sm font-semibold text-blue-950 dark:text-blue-100">{copy.sectionTitle}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <UsernameMiniList label={copy.followingAdded} usernames={diff.followingAdded} />
        <UsernameMiniList label={copy.followingRemoved} usernames={diff.followingRemoved} />
        <UsernameMiniList label={copy.followersAdded} usernames={diff.followersAdded} />
        <UsernameMiniList label={copy.followersRemoved} usernames={diff.followersRemoved} />
      </div>
    </div>
  );
}

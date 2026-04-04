"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    <div className="mt-6 rounded-xl border border-blue-800/50 bg-blue-950/30 p-4">
      <div className="flex items-start gap-4">
        <Switch
          id="export-tracking-toggle"
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onChange}
          className="mt-0.5"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Label
            htmlFor="export-tracking-toggle"
            className="font-medium text-foreground"
          >
            {copy.toggle}
          </Label>
          <p className="text-xs leading-relaxed text-muted-foreground">{copy.toggleHint}</p>
        </div>
      </div>
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
    <div className="rounded-lg border border-blue-800/40 bg-blue-950/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-200/60">
        {label}{" "}
        <span className="font-normal tabular-nums">({usernames.length})</span>
      </p>
      {usernames.length === 0 ? (
        <p className="mt-2 text-sm text-blue-200/55">{empty}</p>
      ) : (
        <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto text-sm text-blue-100/90">
          {usernames.map((u) => (
            <li key={u} className="break-all">
              <a
                href={`https://www.instagram.com/${u}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline-offset-2 hover:underline"
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
      <div className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
        <h3 className="text-sm font-semibold text-blue-100">{copy.sectionTitle}</h3>
        <p className="mt-2 text-sm text-blue-200/70">{copy.baselineOnly}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <h3 className="text-sm font-semibold text-blue-100">{copy.sectionTitle}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <UsernameMiniList label={copy.followingAdded} usernames={diff.followingAdded} />
        <UsernameMiniList label={copy.followingRemoved} usernames={diff.followingRemoved} />
        <UsernameMiniList label={copy.followersAdded} usernames={diff.followersAdded} />
        <UsernameMiniList label={copy.followersRemoved} usernames={diff.followersRemoved} />
      </div>
    </div>
  );
}

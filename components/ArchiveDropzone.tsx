import type { ChangeEvent } from "react";
import { Archive, CircleCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ArchiveDropzoneProps = {
  id?: string;
  inputKey: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  hasArchive: boolean;
  archiveName: string | null;
  selectedBasenames: string[];
  isLoading?: boolean;
  onChange: (files: FileList | null) => void;
};

export function ArchiveDropzone({
  id = "analyzer-archive",
  inputKey,
  inputRef,
  hasArchive,
  archiveName,
  selectedBasenames,
  isLoading,
  onChange,
}: ArchiveDropzoneProps) {
  return (
    <div className="flex flex-col gap-2" data-tour="drop-archive">
      <Label htmlFor={id} className="font-medium text-[var(--text)]">
        {messages.analyzer.archiveLabel}
      </Label>
      <label
        htmlFor={id}
        className={cn(
          "surface-inset relative flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed px-4 py-8 text-center transition-[border-color,background-color,box-shadow] duration-200 [transition-timing-function:var(--ease-out-expo)]",
          "hover:border-[var(--brand)] hover:bg-[color-mix(in_srgb,var(--bg-soft)_55%,var(--bg-inset))]",
          hasArchive &&
            "border-[color-mix(in_srgb,var(--success)_70%,var(--line))] bg-[color-mix(in_srgb,var(--success)_10%,var(--bg-inset))] outline outline-2 outline-[color-mix(in_srgb,var(--success)_45%,transparent)] -outline-offset-1",
          isLoading && "pointer-events-none opacity-80",
        )}
      >
        <Archive
          className={cn(
            "size-7 text-[var(--text-muted)]",
            hasArchive && "text-[var(--success)]",
          )}
          aria-hidden
        />
        <span className="text-sm text-[var(--text-soft)]">
          {isLoading
            ? messages.analyzer.analyzing
            : hasArchive
              ? archiveName ?? messages.analyzer.archiveSelected
              : messages.analyzer.dropArchivePrompt}
        </span>
        <input
          ref={inputRef}
          key={`${id}-${inputKey}`}
          id={id}
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files)}
          className="sr-only"
          disabled={isLoading}
        />
        {hasArchive && !isLoading ? (
          <CircleCheck
            className="pointer-events-none absolute top-3 right-3 size-5 text-[var(--success)] animate-in zoom-in-50 fade-in duration-200"
            aria-hidden
          />
        ) : null}
      </label>
      <span className="text-xs text-tertiary-readable">{messages.analyzer.archiveHint}</span>
      {selectedBasenames.length > 0 ? (
        <p className="text-xs text-secondary-readable">
          <span className="font-medium text-[var(--text-soft)]">
            {messages.analyzer.selectedFilesLabel}:{" "}
          </span>
          <span className="font-mono">{selectedBasenames.join(", ")}</span>
        </p>
      ) : null}
    </div>
  );
}

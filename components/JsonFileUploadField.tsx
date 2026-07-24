import type { ChangeEvent } from "react";
import { CircleCheck, FileJson } from "lucide-react";
import { Label } from "@/components/ui/label";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type JsonFileUploadFieldProps = {
  id: string;
  inputKey: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  label: string;
  hint: string;
  hasFiles: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function JsonFileUploadField({
  id,
  inputKey,
  inputRef,
  label,
  hint,
  hasFiles,
  onChange,
}: JsonFileUploadFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-medium text-[var(--text)]">
        {label}
      </Label>
      <label
        htmlFor={id}
        className={cn(
          "surface-inset relative flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed px-4 py-5 text-center transition-[border-color,background-color,box-shadow] duration-200 [transition-timing-function:var(--ease-out-expo)]",
          "hover:border-[var(--brand)] hover:bg-[color-mix(in_srgb,var(--bg-soft)_55%,var(--bg-inset))]",
          hasFiles &&
            "border-[color-mix(in_srgb,var(--success)_70%,var(--line))] bg-[color-mix(in_srgb,var(--success)_10%,var(--bg-inset))] outline outline-2 outline-[color-mix(in_srgb,var(--success)_45%,transparent)] -outline-offset-1",
        )}
      >
        <FileJson
          className={cn(
            "size-6 text-[var(--text-muted)]",
            hasFiles && "text-[var(--success)]",
          )}
          aria-hidden
        />
        <span className="text-sm text-[var(--text-soft)]">
          {hasFiles ? messages.analyzer.jsonSelected : messages.analyzer.dropJsonPrompt}
        </span>
        <input
          ref={inputRef}
          key={`${id}-${inputKey}`}
          id={id}
          type="file"
          accept=".json,application/json"
          multiple
          onChange={onChange}
          className="sr-only"
        />
        {hasFiles ? (
          <CircleCheck
            className="pointer-events-none absolute top-3 right-3 size-5 text-[var(--success)] animate-in zoom-in-50 fade-in duration-200"
            aria-hidden
          />
        ) : null}
      </label>
      <span className="text-xs text-tertiary-readable">{hint}</span>
    </div>
  );
}

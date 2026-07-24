import type { ChangeEvent } from "react";
import { CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <Label htmlFor={id} className="font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
          key={`${id}-${inputKey}`}
          id={id}
          type="file"
          accept=".json,application/json"
          multiple
          onChange={onChange}
          className={cn(
            "transition-[border-color,box-shadow,background-color] duration-200 [transition-timing-function:var(--ease-out-expo)] hover:border-sky-500/40 hover:bg-input/45",
            hasFiles &&
              "border-emerald-400/85 pr-10 outline outline-2 outline-emerald-400/55 -outline-offset-1 hover:border-emerald-400 focus-visible:border-emerald-400 focus-visible:ring-emerald-500/30",
          )}
        />
        {hasFiles ? (
          <CircleCheck
            className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-emerald-300 animate-in zoom-in-50 fade-in duration-200"
            aria-hidden
          />
        ) : null}
      </div>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

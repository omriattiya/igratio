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
      <Label htmlFor={id} className="text-foreground">
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
            hasFiles &&
              "border-emerald-500/80 pr-10 outline outline-2 outline-emerald-500/70 -outline-offset-1 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30",
          )}
        />
        {hasFiles ? (
          <CircleCheck
            className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-emerald-400"
            aria-hidden
          />
        ) : null}
      </div>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}

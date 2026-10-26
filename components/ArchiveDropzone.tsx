import type { ChangeEvent } from "react";
import { Box, Stack, Text } from "@mantine/core";
import { Archive, CircleCheck } from "lucide-react";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ArchiveDropzoneProps = {
  id?: string;
  hasArchive: boolean;
  archiveName: string | null;
  selectedBasenames: string[];
  isLoading?: boolean;
  onChange: (files: FileList | null) => void;
};

export function ArchiveDropzone({
  id = "analyzer-archive",
  hasArchive,
  archiveName,
  selectedBasenames,
  isLoading,
  onChange,
}: ArchiveDropzoneProps) {
  return (
    <Stack gap={8} data-tour="drop-archive">
      <Text component="label" htmlFor={id} fw={500} size="sm" c="var(--text)">
        {messages.analyzer.archiveLabel}
      </Text>
      <Box
        component="label"
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
        <Text component="span" size="sm" c="var(--text-soft)">
          {isLoading
            ? messages.analyzer.analyzing
            : hasArchive
              ? archiveName ?? messages.analyzer.archiveSelected
              : messages.analyzer.dropArchivePrompt}
        </Text>
        <input
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
      </Box>
      <Text size="xs" className="text-tertiary-readable">
        {messages.analyzer.archiveHint}
      </Text>
      {selectedBasenames.length > 0 ? (
        <Text size="xs" className="text-secondary-readable">
          <Text component="span" inherit fw={500} c="var(--text-soft)">
            {messages.analyzer.selectedFilesLabel}:{" "}
          </Text>
          <Text component="span" inherit ff="monospace">
            {selectedBasenames.join(", ")}
          </Text>
        </Text>
      ) : null}
    </Stack>
  );
}

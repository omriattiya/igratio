import { ArrowRightLeft } from "lucide-react";
import { JsonFileUploadField } from "@/components/JsonFileUploadField";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages } from "@/lib/i18n";
import type { LoadState } from "@/hooks/useAnalyzerState";

type AnalyzerFileUploadSectionProps = {
  state: LoadState;
  fileInputKey: number;
  followerInputRef: React.RefObject<HTMLInputElement | null>;
  followingInputRef: React.RefObject<HTMLInputElement | null>;
  followerFiles: FileList | null;
  followingFiles: FileList | null;
  canSwap: boolean;
  onFollowerChange: (files: FileList | null) => void;
  onFollowingChange: (files: FileList | null) => void;
  onSwap: () => void;
};

export function AnalyzerFileUploadSection({
  state,
  fileInputKey,
  followerInputRef,
  followingInputRef,
  followerFiles,
  followingFiles,
  canSwap,
  onFollowerChange,
  onFollowingChange,
  onSwap,
}: AnalyzerFileUploadSectionProps) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto_1fr]">
      <div data-tour="upload-followers">
        <JsonFileUploadField
          id="analyzer-followers"
          inputKey={fileInputKey}
          inputRef={followerInputRef}
          label={messages.analyzer.followersLabel}
          hint={messages.analyzer.followersHint}
          hasFiles={Boolean(followerFiles?.length)}
          onChange={(e) => onFollowerChange(e.target.files)}
        />
      </div>
      <div className="flex items-center justify-center sm:pt-6">
        <Tooltip.Provider delay={0}>
          <Tooltip.Root>
            <Tooltip.Trigger
              render={(props) => (
                <Button
                  {...props}
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={!canSwap || state.status === AnalyzerLoadStatus.Loading}
                  onClick={onSwap}
                  aria-label={messages.analyzer.swapFilesAriaLabel}
                  className="text-blue-300 hover:text-blue-100"
                >
                  <ArrowRightLeft className="size-4" />
                </Button>
              )}
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side="top" sideOffset={8}>
                <TooltipPopup>{messages.analyzer.swapFilesTooltip}</TooltipPopup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <div data-tour="upload-following">
        <JsonFileUploadField
          id="analyzer-following"
          inputKey={fileInputKey}
          inputRef={followingInputRef}
          label={messages.analyzer.followingLabel}
          hint={messages.analyzer.followingHint}
          hasFiles={Boolean(followingFiles?.length)}
          onChange={(e) => onFollowingChange(e.target.files)}
        />
      </div>
    </div>
  );
}

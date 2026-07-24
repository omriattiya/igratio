import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip";
import { AnalyzerLoadStatus } from "@/lib/analyzerLoadStatus";
import { messages } from "@/lib/i18n";
import type { LoadState } from "@/hooks/useAnalyzerState";

type AnalyzerActionsProps = {
  state: LoadState;
  canReset: boolean;
  onReset: () => void;
};

export function AnalyzerActions({
  state,
  canReset,
  onReset,
}: AnalyzerActionsProps) {
  if (!canReset && state.status !== AnalyzerLoadStatus.Ready) {
    return null;
  }

  return (
    <Tooltip.Provider delay={0}>
      <div className="flex w-full justify-end">
        <AlertDialog.Root>
          <Tooltip.Root>
            <AlertDialog.Trigger
              render={(triggerProps) => (
                <Tooltip.Trigger
                  type="button"
                  delay={0}
                  disabled={state.status === AnalyzerLoadStatus.Loading}
                  render={(tooltipProps) => (
                    <Button
                      {...tooltipProps}
                      {...triggerProps}
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-auto border-destructive/90 text-destructive hover:bg-destructive/15"
                      aria-label={messages.analyzer.resetAnalysisAriaLabel}
                    >
                      <Trash2 className="size-4" />
                      {messages.analyzer.resetAnalysis}
                    </Button>
                  )}
                />
              )}
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side="top" sideOffset={8}>
                <TooltipPopup>{messages.analyzer.resetAnalysisTooltip}</TooltipPopup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
          <AlertDialog.Portal>
            <AlertDialogBackdrop />
            <AlertDialogPopup>
              <AlertDialogTitle>
                {messages.analyzer.resetConfirm.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {messages.analyzer.resetConfirm.description}
              </AlertDialogDescription>
              <p className="mt-2 text-sm leading-relaxed text-emerald-300/80">
                {messages.analyzer.resetConfirm.privacy}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <AlertDialog.Close
                  render={(props) => (
                    <Button {...props} variant="outline" size="lg">
                      {messages.analyzer.resetConfirm.cancel}
                    </Button>
                  )}
                />
                <AlertDialog.Close
                  render={(props) => (
                    <Button
                      {...props}
                      variant="destructive"
                      size="lg"
                      onClick={(e) => {
                        props.onClick?.(e);
                        onReset();
                      }}
                    >
                      {messages.analyzer.resetConfirm.confirm}
                    </Button>
                  )}
                />
              </div>
            </AlertDialogPopup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
    </Tooltip.Provider>
  );
}

import { Trash2, WandSparkles } from "lucide-react";
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
  canAnalyze: boolean;
  onAnalyze: () => void;
  onReset: () => void;
};

export function AnalyzerActions({
  state,
  canAnalyze,
  onAnalyze,
  onReset,
}: AnalyzerActionsProps) {
  return (
    <Tooltip.Provider delay={0}>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          size="lg"
          disabled={!canAnalyze || state.status === AnalyzerLoadStatus.Loading}
          onClick={onAnalyze}
          className="relative w-full overflow-hidden bg-[length:200%_100%] bg-[position:0%_0%] bg-gradient-to-r from-teal-500 via-sky-400 to-teal-500 px-5 text-white shadow-md shadow-teal-900/30 transition-all duration-500 ease-in-out hover:bg-[position:100%_0%] hover:shadow-lg hover:shadow-teal-900/40 disabled:from-slate-700 disabled:via-slate-700 disabled:to-slate-700 disabled:shadow-none sm:w-auto"
          data-tour="analyze-button"
        >
          <WandSparkles className="size-4" />
          {state.status === AnalyzerLoadStatus.Loading
            ? messages.analyzer.analyzing
            : messages.analyzer.analyze}
        </Button>
        {(canAnalyze || state.status === AnalyzerLoadStatus.Ready) && (
          <div className="self-end sm:self-auto">
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
        )}
      </div>
    </Tooltip.Provider>
  );
}

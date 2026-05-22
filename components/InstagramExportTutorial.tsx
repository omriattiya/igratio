"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpenText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { messages, t } from "@/lib/i18n";
import {
  TUTORIAL_IMAGES,
  getCachedSrc,
  preloadAllTutorialImages,
} from "@/lib/tutorialImages";
import { cn } from "@/lib/utils";

const copy = messages.analyzer.exportTutorial;
const steps = copy.steps;

const TUTORIAL_LINK_CLASS =
  "font-medium text-blue-300 underline decoration-blue-400/50 underline-offset-2 transition-colors hover:text-blue-200 hover:decoration-blue-300";

function stepIndexFromNumber(stepNumber: number): number {
  return stepNumber - 1;
}

export function InstagramExportTutorial() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    preloadAllTutorialImages();
  }, []);

  const open = useCallback(() => {
    setStep(0);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => setStep(0);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!dialogRef.current?.open) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStep((s) => Math.min(steps.length - 1, s + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const current = steps[step];
  const image = TUTORIAL_IMAGES[step];
  const quickStart = "quickStart" in current ? current.quickStart : null;

  const dialog = (
    <dialog
      ref={dialogRef}
      aria-labelledby="export-tutorial-title"
      className={cn(
        "hidden w-[70vw] max-w-[700px] h-[90vh] max-h-[90vh]",
        "open:fixed open:left-1/2 open:top-1/2 open:z-50 open:-translate-x-1/2 open:-translate-y-1/2",
        "open:flex open:flex-col",
        "overflow-hidden rounded-2xl border border-blue-800/70 bg-blue-950 p-0 text-blue-50 shadow-2xl shadow-black/50",
        "backdrop:bg-black/65 backdrop:backdrop-blur-sm",
        "opacity-0 transition-opacity duration-200 ease-out open:opacity-100",
        "starting:open:opacity-0",
      )}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) close();
      }}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-blue-800/50 px-4 py-3">
        <div>
          <p className="text-xs font-medium tabular-nums text-blue-300/80">
            {t(copy.stepOf, { current: step + 1, total: steps.length })}
          </p>
          <h2
            id="export-tutorial-title"
            className="mt-0.5 text-base font-semibold leading-snug text-blue-50"
          >
            {current.title}
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-blue-200/80 hover:bg-blue-900/60 hover:text-blue-50"
          aria-label={copy.close}
          onClick={close}
        >
          <X className="size-4" />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {quickStart ? (
          <div className="mx-4 mt-4 shrink-0 space-y-2 rounded-xl border border-blue-700/50 bg-blue-900/40 px-3 py-3 text-sm">
            <p className="leading-relaxed text-blue-200/80">
              {quickStart.startPrefix}{" "}
              <a
                href={quickStart.startLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={TUTORIAL_LINK_CLASS}
              >
                {quickStart.startLink.label}
              </a>
            </p>
            <a
              href={quickStart.skipLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(TUTORIAL_LINK_CLASS, "block")}
              onClick={() => setStep(stepIndexFromNumber(quickStart.skipToStep))}
            >
              {quickStart.skipLink.label}
            </a>
          </div>
        ) : null}

        <div className="shrink-0 px-4 pt-4">
          {/* eslint-disable-next-line react/no-danger -- trusted static copy from app messages */}
          <p className="text-sm leading-relaxed text-blue-200/75" dangerouslySetInnerHTML={{ __html: current.description }} />
          {"shortcut" in current && current.shortcut ? (
            <p className="mt-2 text-sm">
              <a
                href={current.shortcut.href}
                target="_blank"
                rel="noopener noreferrer"
                className={TUTORIAL_LINK_CLASS}
              >
                {current.shortcut.label}
              </a>
            </p>
          ) : null}
        </div>

        <div className="relative min-h-0 flex-1 px-4 py-4">
          <div className="flex h-full w-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={image.src}
              src={getCachedSrc(image.src)}
              alt={current.title}
              width={image.width}
              height={image.height}
              className="block max-h-full max-w-full rounded-xl border border-blue-800/50 object-contain"
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-center gap-1.5 px-4 pb-2" role="tablist" aria-label={copy.stepDotsLabel}>
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-label={t(copy.goToStep, { step: i + 1 })}
              aria-selected={i === step}
              className={cn(
                "size-2 rounded-full transition-colors",
                i === step ? "bg-blue-400" : "bg-blue-700/80 hover:bg-blue-600",
              )}
              onClick={() => setStep(i)}
            />
          ))}
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-blue-800/50 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-blue-700/60 bg-transparent text-blue-100 hover:bg-blue-900/50"
          disabled={isFirst}
          onClick={() => setStep((s) => s - 1)}
        >
          <ChevronLeft className="size-4" />
          {copy.previous}
        </Button>
        {isLast ? (
          <Button type="button" size="sm" onClick={close}>
            {copy.finish}
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={() => setStep((s) => s + 1)}>
            {copy.next}
            <ChevronRight className="size-4" />
          </Button>
        )}
      </footer>
    </dialog>
  );

  return (
    <>
      <button type="button" onClick={open} className={TUTORIAL_LINK_CLASS} data-tour="export-tutorial">
        <BookOpenText className="inline-block size-4 align-text-bottom mr-1" />
        {copy.trigger}
      </button>
      {mounted ? createPortal(dialog, document.body) : null}
    </>
  );
}

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
  "font-medium text-[var(--brand)] underline decoration-[color-mix(in_srgb,var(--brand)_55%,transparent)] underline-offset-2 transition-colors duration-150 hover:text-[var(--text)] hover:decoration-[var(--brand)]";

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
        "hidden w-[min(100vw-1.5rem,50rem)] max-h-[min(90vh,56rem)]",
        "open:fixed open:left-1/2 open:top-1/2 open:z-50 open:-translate-x-1/2 open:-translate-y-1/2",
        "open:flex open:flex-col",
        "overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--grad-surface)] p-0 text-[var(--text)]",
        "shadow-[0_24px_64px_-20px_rgba(0,0,0,0.75)]",
        "backdrop:bg-[var(--bg)] backdrop:backdrop-blur-none",
        "opacity-0 transition-opacity duration-200 [transition-timing-function:var(--ease-out-expo)] open:opacity-100",
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
      <header className="surface-card-header flex shrink-0 items-start justify-between gap-3 px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-xs font-medium tabular-nums text-tertiary-readable">
            {t(copy.stepOf, { current: step + 1, total: steps.length })}
          </p>
          <h2
            id="export-tutorial-title"
            className="mt-1 text-base font-semibold leading-snug text-[var(--text)]"
          >
            {current.title}
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="icon-button shrink-0"
          aria-label={copy.close}
          onClick={close}
        >
          <X className="size-4" />
        </Button>
      </header>

      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div key={step} className="flex flex-col gap-4 px-5 py-4">
          {quickStart ? (
            <div className="surface-inset space-y-2 px-3.5 py-3 text-sm">
              <p className="leading-relaxed text-secondary-readable">
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

          <div>
            {/* eslint-disable-next-line react/no-danger -- trusted static copy from app messages */}
            <p
              className="text-sm leading-relaxed text-secondary-readable"
              dangerouslySetInnerHTML={{ __html: current.description }}
            />
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

          <div className="surface-inset flex justify-center p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={image.src}
              src={getCachedSrc(image.src)}
              alt={current.title}
              width={image.width}
              height={image.height}
              decoding="async"
              className="block h-auto w-auto max-w-full rounded-lg"
              style={{
                // Never upscale past the source bitmap — only shrink to fit the dialog.
                maxWidth: `min(100%, ${image.width}px)`,
                maxHeight: `min(52vh, ${image.height}px)`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="flex shrink-0 justify-center gap-1.5 border-t border-[var(--line)] px-5 py-2.5"
        role="tablist"
        aria-label={copy.stepDotsLabel}
      >
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-label={t(copy.goToStep, { step: i + 1 })}
            aria-selected={i === step}
            className={cn(
              "h-2 rounded-full transition-all duration-200 [transition-timing-function:var(--ease-out-expo)]",
              i === step
                ? "w-5 bg-[var(--brand)]"
                : "w-2 bg-[var(--line-strong)] hover:bg-[var(--brand-2)]",
            )}
            onClick={() => setStep(i)}
          />
        ))}
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--line)] px-5 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[var(--line)] bg-transparent text-[var(--text-soft)] transition-colors duration-150 hover:bg-[var(--bg-soft)] hover:text-[var(--text)]"
          disabled={isFirst}
          onClick={() => setStep((s) => s - 1)}
        >
          <ChevronLeft className="size-4" />
          {copy.previous}
        </Button>
        {isLast ? (
          <Button
            type="button"
            size="sm"
            className="border-0 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-[var(--brand-contrast)] hover:brightness-110"
            onClick={close}
          >
            {copy.finish}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="border-0 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-[var(--brand-contrast)] hover:brightness-110"
            onClick={() => setStep((s) => s + 1)}
          >
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
        <BookOpenText className="mr-1 inline-block size-4 align-text-bottom" />
        {copy.trigger}
      </button>
      {mounted ? createPortal(dialog, document.body) : null}
    </>
  );
}

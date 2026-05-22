"use client";

import { useCallback, useEffect, useState } from "react";
import { useJoyride, EVENTS, STATUS, type Step } from "react-joyride";
import { messages } from "@/lib/i18n";

const POPOVER_DISMISSED_KEY = "igratio-tour-popover-dismissed";

const TARGETS = [
  '[data-tour="export-tutorial"]',
  '[data-tour="upload-followers"]',
  '[data-tour="upload-following"]',
  '[data-tour="track-changes"]',
  '[data-tour="analyze-button"]',
  '[data-tour="analyze-button"]',
];

const STEPS: Step[] = messages.tour.steps.map((step, i) => ({
  target: TARGETS[i],
  title: step.title,
  content: step.content,
  skipBeacon: true,
}));

export function AppTour({ run, onFinish }: { run: boolean; onFinish: () => void }) {
  const { Tour, on } = useJoyride({
    steps: STEPS,
    run,
    continuous: true,
    scrollToFirstStep: true,
    options: {
      buttons: ["back", "close", "primary", "skip"],
      closeButtonAction: "skip",
      showProgress: true,
      overlayClickAction: false,
      primaryColor: "#3b82f6",
      backgroundColor: "#172554",
      textColor: "#e0f2fe",
      arrowColor: "#172554",
      overlayColor: "rgba(0, 0, 0, 0.65)",
      zIndex: 10000,
    },
    locale: {
      back: messages.tour.back,
      close: messages.tour.close,
      last: messages.tour.last,
      next: messages.tour.next,
      skip: messages.tour.skip,
    },
    styles: {
      tooltip: { borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.4)" },
      tooltipTitle: { color: "#f0f9ff", fontSize: "16px", fontWeight: 600 },
      tooltipContent: { color: "#bfdbfe", fontSize: "14px" },
      buttonPrimary: { backgroundColor: "#3b82f6", borderRadius: "8px", fontSize: "14px", padding: "8px 16px", color: "#ffffff" },
      buttonBack: { color: "#93c5fd", fontSize: "14px" },
      buttonSkip: { color: "#64748b", fontSize: "13px" },
    },
  });

  useEffect(() => {
    const unsubEnd = on(EVENTS.TOUR_END, () => {
      onFinish();
    });

    const unsubStatus = on(EVENTS.TOUR_STATUS, (data) => {
      if (data.status === STATUS.SKIPPED) {
        onFinish();
      }
    });

    return () => {
      unsubEnd();
      unsubStatus();
    };
  }, [on, onFinish]);

  return Tour;
}

export function useAppTour() {
  const [run, setRun] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(POPOVER_DISMISSED_KEY)) {
        setShowPopover(true);
      }
    } catch {}
  }, []);

  const dismissPopover = useCallback(() => {
    setShowPopover(false);
    try {
      localStorage.setItem(POPOVER_DISMISSED_KEY, "1");
    } catch {}
  }, []);

  const relaunch = useCallback(() => {
    setShowPopover(false);
    try {
      localStorage.setItem(POPOVER_DISMISSED_KEY, "1");
    } catch {}
    setRun(true);
  }, []);

  const finish = useCallback(() => {
    setRun(false);
  }, []);

  return { run, relaunch, finish, showPopover, dismissPopover };
}

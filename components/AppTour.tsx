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

const WIDER_TOOLTIP = { tooltip: { minWidth: "440px" } };

const STEPS: Step[] = messages.tour.steps.map((step, i) => ({
  target: TARGETS[i],
  title: step.title,
  content: step.content,
  skipBeacon: true,
  ...(i === 2 || i === 4 ? { styles: WIDER_TOOLTIP } : {}),
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
      backgroundColor: "#121a33",
      textColor: "#c5d4ec",
      arrowColor: "#121a33",
      overlayColor: "rgba(11, 18, 36, 0.88)",
      zIndex: 10000,
      scrollOffset: 96,
      spotlightRadius: 12,
      spotlightPadding: 8,
    },
    locale: {
      back: messages.tour.back,
      close: messages.tour.close,
      last: messages.tour.last,
      next: messages.tour.next,
      skip: messages.tour.skip,
    },
    styles: {
      tooltip: {
        borderRadius: "16px",
        border: "1px solid #2a3a5c",
        background:
          "linear-gradient(165deg, color-mix(in srgb, #121a33 92%, #38bdf8) 0%, #121a33 42%, #121a33 100%)",
        boxShadow: "0 4px 16px -6px #00000080",
        padding: "16px",
      },
      tooltipTitle: {
        color: "#eef3ff",
        fontSize: "16px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      tooltipContent: {
        color: "#9aafd0",
        fontSize: "14px",
        lineHeight: 1.55,
      },
      buttonPrimary: {
        background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        padding: "8px 16px",
        color: "#041018",
        border: "none",
      },
      buttonBack: {
        color: "#9aafd0",
        fontSize: "14px",
      },
      buttonSkip: {
        color: "#9aafd0",
        fontSize: "13px",
      },
      buttonClose: {
        color: "#9aafd0",
      },
      spotlight: {
        borderRadius: "12px",
      },
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

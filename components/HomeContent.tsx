"use client";

import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";
import { SiteHeader } from "@/components/SiteHeader";
import { AppTour, useAppTour } from "@/components/AppTour";
import { messages } from "@/lib/i18n";

export function HomeContent() {
  const { run, relaunch, finish, showPopover, dismissPopover } = useAppTour();

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <SiteHeader
        title={messages.home.headerTitle}
        description={messages.home.headerDescription}
        privacyNote={messages.home.headerPrivacy}
        popoverText={messages.tour.popover}
        showPopover={showPopover}
        onDismissPopover={dismissPopover}
        onRelaunchTour={relaunch}
        tourTooltip={messages.home.tourTooltip}
        linkedinTooltip={messages.home.linkedinTooltip}
        githubTooltip={messages.home.githubTooltip}
      />
      <main className="page-in relative flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
        <InstagramAnalyzer />
      </main>
      <footer className="relative border-t border-[var(--line)] px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-tertiary-readable">
          <span>IG Ratio</span>
          <span>Open source &middot; by Omri Attiya</span>
        </div>
      </footer>
      <AppTour run={run} onFinish={finish} />
    </div>
  );
}

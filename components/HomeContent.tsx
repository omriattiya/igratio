"use client";

import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";
import { SiteHeader } from "@/components/SiteHeader";
import { AppTour, useAppTour } from "@/components/AppTour";
import { messages } from "@/lib/i18n";

export function HomeContent() {
  const { run, relaunch, finish, showPopover, dismissPopover } = useAppTour();

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,212,191,0.04),rgba(56,189,248,0.03)_50%,transparent_70%)]" />
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
      <main className="relative flex flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <InstagramAnalyzer />
      </main>
      <footer className="relative border-t border-blue-900/30 px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-blue-300/45">
          <span>IG Ratio</span>
          <span>Open source &middot; by Omri Attiya</span>
        </div>
      </footer>
      <AppTour run={run} onFinish={finish} />
    </div>
  );
}

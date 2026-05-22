"use client";

import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";
import { SiteHeader } from "@/components/SiteHeader";
import { AppTour, useAppTour } from "@/components/AppTour";
import { messages } from "@/lib/i18n";

export function HomeContent() {
  const { run, relaunch, finish, showPopover, dismissPopover } = useAppTour();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
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
      <main className="flex flex-1 flex-col px-6 py-10">
        <InstagramAnalyzer />
      </main>
      <AppTour run={run} onFinish={finish} />
    </div>
  );
}

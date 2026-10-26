"use client";

import { Box, Group, Text } from "@mantine/core";
import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";
import { SiteHeader } from "@/components/SiteHeader";
import { AppTour, useAppTour } from "@/components/AppTour";
import { messages } from "@/lib/i18n";

export function HomeContent() {
  const { run, relaunch, finish, showPopover, dismissPopover } = useAppTour();

  return (
    <Box className="relative flex min-h-full flex-1 flex-col">
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
      <Box
        component="main"
        className="page-in relative flex flex-1 flex-col items-center px-4 py-6 sm:px-6 sm:py-8"
      >
        <InstagramAnalyzer />
      </Box>
      <Box component="footer" className="relative border-t border-[var(--line)] px-6 py-6">
        <Group justify="space-between" className="mx-auto w-full max-w-4xl">
          <Text size="xs" className="text-tertiary-readable">
            IG Ratio
          </Text>
          <Text size="xs" className="text-tertiary-readable">
            Open source · by Omri Attiya
          </Text>
        </Group>
      </Box>
      <AppTour run={run} onFinish={finish} />
    </Box>
  );
}

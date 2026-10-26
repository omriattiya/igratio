"use client";

import { MantineProvider } from "@mantine/core";
import { cssVariablesResolver, theme } from "@/lib/mantine-theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      forceColorScheme="dark"
      defaultColorScheme="dark"
      cssVariablesResolver={cssVariablesResolver}
    >
      {children}
    </MantineProvider>
  );
}

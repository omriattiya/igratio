"use client";

import * as React from "react";
import { Tooltip } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

export { Tooltip };

export function TooltipPopup({
  className,
  ...props
}: React.ComponentProps<typeof Tooltip.Popup>) {
  return (
    <Tooltip.Popup
      className={cn(
        "z-50 max-w-xs rounded-lg border border-border bg-popover px-3 py-2 text-sm leading-snug text-popover-foreground shadow-md outline-none",
        "transition-opacity duration-200 ease-out",
        "opacity-100 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

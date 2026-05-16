"use client";

import * as React from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";

import { cn } from "@/lib/utils";

export { AlertDialog };

export function AlertDialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialog.Backdrop>) {
  return (
    <AlertDialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "transition-opacity duration-200 ease-out",
        "opacity-100 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogPopup({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialog.Popup>) {
  return (
    <AlertDialog.Popup
      className={cn(
        "fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-blue-800/60 bg-blue-950 p-6 shadow-2xl",
        "transition-all duration-200 ease-out",
        "scale-100 opacity-100 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialog.Title>) {
  return (
    <AlertDialog.Title
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialog.Description>) {
  return (
    <AlertDialog.Description
      className={cn("mt-2 text-sm leading-relaxed text-blue-200/75", className)}
      {...props}
    />
  );
}

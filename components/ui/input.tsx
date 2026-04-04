import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

const inputShared =
  "w-full min-w-0 rounded-lg border border-input transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

const inputDefault =
  "h-8 bg-transparent px-2.5 py-1 text-base md:text-sm placeholder:text-muted-foreground disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80"

const inputFile =
  "flex min-h-10 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 bg-input/30 py-2 pl-2.5 pr-2 text-sm leading-normal text-muted-foreground dark:bg-input/30"

const fileSelectorButton =
  "file:mr-3 file:inline-flex file:h-9 file:shrink-0 file:cursor-pointer file:items-center file:justify-center file:self-center file:rounded-md file:border-0 file:bg-primary file:px-3.5 file:text-sm file:font-medium file:leading-none file:text-primary-foreground hover:file:bg-primary/90"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const isFile = type === "file"

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        inputShared,
        isFile ? cn(inputFile, fileSelectorButton) : inputDefault,
        className
      )}
      {...props}
    />
  )
}

export { Input }

import { CircleHelp, Lock, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Tooltip, TooltipPopup } from "@/components/ui/tooltip";

type SiteHeaderProps = {
  title: string;
  description: string;
  privacyNote: string;
  popoverText?: string;
  showPopover?: boolean;
  onDismissPopover?: () => void;
  onRelaunchTour?: () => void;
  tourTooltip?: string;
  linkedinTooltip?: string;
  githubTooltip?: string;
};

export function SiteHeader({
  title,
  description,
  privacyNote,
  popoverText,
  showPopover,
  onDismissPopover,
  onRelaunchTour,
  tourTooltip,
  linkedinTooltip,
  githubTooltip,
}: SiteHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-teal-500/15 bg-gradient-to-b from-blue-950/95 to-blue-950/80 px-6 py-8 backdrop-blur-sm sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,rgba(45,212,191,0.07),rgba(56,189,248,0.04)_60%,transparent)]" />
      <div className="relative mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex items-center gap-3">
            {showPopover && popoverText && (
              <div className="absolute right-full top-1/2 mr-3 flex -translate-y-1/2 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex items-center whitespace-nowrap rounded-lg bg-blue-600 shadow-lg shadow-blue-900/40">
                  <button
                    type="button"
                    onClick={onRelaunchTour}
                    className="rounded-l-lg px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    {popoverText}
                  </button>
                  <button
                    type="button"
                    onClick={onDismissPopover}
                    aria-label="Dismiss tour hint"
                    className="rounded-r-lg px-1.5 py-1.5 text-blue-200/70 transition-colors hover:bg-blue-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="border-y-[6px] border-l-[8px] border-y-transparent border-l-blue-600" />
              </div>
            )}
            <span className="group/logo flex items-center gap-3.5 transition-transform duration-300 ease-out hover:scale-[1.02]">
              <Logo className="size-10 shrink-0 transition-[filter] duration-300 group-hover/logo:drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]" />
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
            </span>
          </div>
          <Tooltip.Provider delay={0}>
            <div className="flex shrink-0 items-center gap-0.5">
              {onRelaunchTour && (
                <Tooltip.Root>
                  <Tooltip.Trigger
                    render={
                      <button
                        type="button"
                        onClick={onRelaunchTour}
                        aria-label="Replay guided tour"
                        className="rounded-md p-1.5 text-blue-300/60 transition-colors hover:text-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                      >
                        <CircleHelp className="size-5" />
                      </button>
                    }
                  />
                  {tourTooltip && (
                    <Tooltip.Portal>
                      <Tooltip.Positioner side="bottom" sideOffset={8}>
                        <TooltipPopup>{tourTooltip}</TooltipPopup>
                      </Tooltip.Positioner>
                    </Tooltip.Portal>
                  )}
                </Tooltip.Root>
              )}
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={
                    <a
                      href="https://www.linkedin.com/in/omriat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn profile"
                      className="rounded-md p-1.5 text-blue-300/60 transition-colors hover:text-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  }
                />
                {linkedinTooltip && (
                  <Tooltip.Portal>
                    <Tooltip.Positioner side="bottom" sideOffset={8}>
                      <TooltipPopup>{linkedinTooltip}</TooltipPopup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger
                  render={
                    <a
                      href="https://github.com/omriattiya/igratio"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View source on GitHub"
                      className="rounded-md p-1.5 text-blue-300/60 transition-colors hover:text-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                    >
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    </a>
                  }
                />
                {githubTooltip && (
                  <Tooltip.Portal>
                    <Tooltip.Positioner side="bottom" sideOffset={8}>
                      <TooltipPopup>{githubTooltip}</TooltipPopup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            </div>
          </Tooltip.Provider>
        </div>
        <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-blue-100/90">{description}</p>
        <p className="mt-2.5 flex max-w-xl items-start gap-2 text-xs leading-relaxed text-blue-200/70">
          <Lock
            className="mt-0.5 size-3.5 shrink-0 text-blue-300/70"
            aria-hidden
          />
          <span
            className="[&_a]:font-medium [&_a]:text-blue-200/90 [&_a]:underline [&_a]:decoration-blue-300/50 [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:hover:text-blue-50 [&_a]:focus-visible:rounded-sm [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-blue-300"
            // eslint-disable-next-line react/no-danger -- trusted static copy from app messages
            dangerouslySetInnerHTML={{ __html: privacyNote }}
          />
        </p>
      </div>
    </header>
  );
}

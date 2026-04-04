import { Lock } from "lucide-react";

type SiteHeaderProps = {
  title: string;
  description: string;
  privacyNote: string;
};

export function SiteHeader({ title, description, privacyNote }: SiteHeaderProps) {
  return (
    <header className="border-b border-blue-900/60 bg-blue-950/85 px-6 py-10 backdrop-blur">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-blue-50">{title}</h1>
        <p className="mt-2 max-w-2xl text-blue-200/70">{description}</p>
        <p className="mt-2 flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-blue-200/55">
          <Lock
            className="mt-0.5 size-4 shrink-0 text-blue-300/70"
            aria-hidden
          />
          <span
            className="[&_a]:font-medium [&_a]:text-blue-200/85 [&_a]:underline [&_a]:decoration-blue-300/50 [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:hover:text-blue-50 [&_a]:focus-visible:rounded-sm [&_a]:focus-visible:outline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-blue-300"
            // eslint-disable-next-line react/no-danger -- trusted static copy from app messages
            dangerouslySetInnerHTML={{ __html: privacyNote }}
          />
        </p>
      </div>
    </header>
  );
}

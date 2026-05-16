import { messages } from "@/lib/i18n";

type InstagramUserListProps = {
  title: string;
  usernames: string[];
  accent: string;
  /** Usernames new since last tracked snapshot (following or followers added). */
  markNew?: Set<string> | null;
};

export function InstagramUserList({
  title,
  usernames,
  accent,
  markNew,
}: InstagramUserListProps) {
  if (usernames.length === 0) {
    return (
      <section className="flex h-full flex-col rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-2 text-sm text-blue-200/60">
          {messages.userList.empty}
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <h3 className={`text-sm font-semibold ${accent}`}>
        {title}{" "}
        <span className="font-normal text-blue-200/60">({usernames.length})</span>
      </h3>
      <ul className="mt-3 max-h-[28rem] min-h-0 flex-1 list-none space-y-1.5 overflow-y-auto text-sm text-blue-100/90">
        {usernames.map((u) => (
          <li key={u} className="flex flex-wrap items-center gap-2 break-all">
            <a
              href={`https://www.instagram.com/${u}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 text-blue-300 underline-offset-2 hover:underline"
            >
              {u}
            </a>
            {markNew?.has(u) ? (
              <span
                className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
                aria-label={messages.userList.newBadge}
              >
                {messages.userList.newBadge}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

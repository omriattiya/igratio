import { messages } from "@/lib/i18n";

type InstagramUserListProps = {
  title: string;
  usernames: string[];
  accent: string;
};

export function InstagramUserList({ title, usernames, accent }: InstagramUserListProps) {
  if (usernames.length === 0) {
    return (
      <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
        <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
        <p className="mt-2 text-sm text-blue-200/60">
          {messages.userList.empty}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-4">
      <h3 className={`text-sm font-semibold ${accent}`}>
        {title}{" "}
        <span className="font-normal text-blue-200/60">({usernames.length})</span>
      </h3>
      <ul className="mt-3 max-h-64 list-inside list-disc overflow-y-auto text-sm text-blue-100/90">
        {usernames.map((u) => (
          <li key={u} className="break-all">
            <a
              href={`https://www.instagram.com/${u}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 underline-offset-2 hover:underline"
            >
              {u}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

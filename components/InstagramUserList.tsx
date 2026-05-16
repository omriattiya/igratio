import { messages } from "@/lib/i18n";
import { UserLinkCard, type UserStatus } from "@/components/UserLinkCard";

type InstagramUserListProps = {
  title: string;
  usernames: string[];
  accent: string;
  userStatus: UserStatus;
  /** Usernames new since last tracked snapshot (following or followers added). */
  markNew?: Set<string> | null;
};

export function InstagramUserList({
  title,
  usernames,
  accent,
  userStatus,
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
      <ul className="mt-3 min-h-0 flex-1 basis-0 list-none space-y-2 overflow-y-auto">
        {usernames.map((u) => (
          <li key={u}>
            <UserLinkCard
              username={u}
              status={userStatus}
              isNew={markNew?.has(u)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

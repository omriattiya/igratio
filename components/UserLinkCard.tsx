"use client";

import {
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { messages } from "@/lib/i18n";

export type UserStatus =
  | "mutual"
  | "unfollower"
  | "follower"
  | "checked"
  | "new-follow"
  | "removed";

const statusConfig: Record<
  UserStatus,
  { icon: LucideIcon; iconClass: string }
> = {
  mutual: { icon: UserCheck, iconClass: "text-emerald-400" },
  unfollower: { icon: UserX, iconClass: "text-amber-400" },
  follower: { icon: User, iconClass: "text-sky-400" },
  checked: { icon: UserCheck, iconClass: "text-emerald-400/70" },
  "new-follow": { icon: UserPlus, iconClass: "text-blue-400" },
  removed: { icon: UserMinus, iconClass: "text-red-400" },
};

type UserLinkCardProps = {
  username: string;
  status: UserStatus;
  isNew?: boolean;
  dimmed?: boolean;
  children?: React.ReactNode;
};

export function UserLinkCard({
  username,
  status,
  isNew,
  dimmed,
  children,
}: UserLinkCardProps) {
  const { icon: Icon, iconClass } = statusConfig[status];

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border border-blue-800/40 bg-blue-950/50 px-3 py-2.5 transition duration-150 hover:border-blue-600/60 hover:bg-blue-900/50 ${dimmed ? "opacity-60" : ""}`}
    >
      {children}
      <Icon
        className={`size-5 shrink-0 ${iconClass} transition-transform duration-150 group-hover:scale-110`}
        aria-hidden
      />
      <a
        href={`https://www.instagram.com/${username}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium leading-snug text-blue-200 underline-offset-2 transition-colors hover:text-blue-100 hover:underline"
      >
        {username}
      </a>
      {isNew && (
        <span
          className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300"
          aria-label={messages.userList.newBadge}
        >
          {messages.userList.newBadge}
        </span>
      )}
    </div>
  );
}

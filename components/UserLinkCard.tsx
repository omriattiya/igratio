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
      className={`group interactive-row flex items-center gap-3 rounded-lg border border-blue-500/30 bg-[#1c355e] px-3 py-2.5 hover:border-sky-400/40 hover:bg-[#234276] hover:shadow-[0_6px_16px_-8px_rgba(37,99,235,0.4)] ${dimmed ? "opacity-55" : ""}`}
    >
      {children}
      <Icon
        className={`size-5 shrink-0 ${iconClass} transition-transform duration-150 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-110`}
        aria-hidden
      />
      <a
        href={`https://www.instagram.com/${username}/`}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium leading-snug text-blue-50 underline-offset-2 transition-colors duration-150 hover:text-sky-200 hover:underline"
      >
        {username}
      </a>
      {isNew && (
        <span
          className="shrink-0 rounded-full border border-emerald-400/45 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200"
          aria-label={messages.userList.newBadge}
        >
          {messages.userList.newBadge}
        </span>
      )}
    </div>
  );
}

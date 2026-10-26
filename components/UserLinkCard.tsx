"use client";

import type { MouseEvent } from "react";
import { Anchor, Badge, Group } from "@mantine/core";
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

const statusConfig: Record<UserStatus, { icon: LucideIcon; iconClass: string }> = {
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

const cardClass =
  "group interactive-row cursor-pointer rounded-[10px] border border-[var(--line)] bg-[var(--bg-inset)] hover:border-[var(--brand)] hover:bg-[color-mix(in_srgb,var(--bg-soft)_80%,transparent)] hover:shadow-[0_6px_16px_-8px_color-mix(in_srgb,var(--brand)_40%,transparent)]";

function toggleCheckboxFromZone(event: MouseEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement;
  if (target.closest(".mantine-Checkbox-root")) return;
  event.currentTarget.querySelector("input")?.click();
}

export function UserLinkCard({ username, status, isNew, dimmed, children }: UserLinkCardProps) {
  const { icon: Icon, iconClass } = statusConfig[status];
  const profileHref = `https://www.instagram.com/${username}/`;

  return (
    <Group
      gap={0}
      wrap="nowrap"
      align="stretch"
      className={`${cardClass} ${dimmed ? "opacity-55" : ""}`}
    >
      {children ? (
        <div
          className="flex shrink-0 cursor-pointer items-center self-stretch py-2.5 pr-2 pl-3"
          onClick={toggleCheckboxFromZone}
        >
          {children}
        </div>
      ) : null}
      <Anchor
        href={profileHref}
        target="_blank"
        rel="noopener noreferrer"
        underline="never"
        c="blue.0"
        className={`flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-3 text-[0.9375rem] font-medium leading-snug transition-colors duration-150 hover:text-sky-200 ${children ? "" : "pl-3"}`}
      >
        <Icon
          className={`size-5 shrink-0 ${iconClass} transition-transform duration-150 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-110`}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate">{username}</span>
        {isNew && (
          <Badge
            variant="light"
            color="green"
            size="xs"
            tt="uppercase"
            fw={600}
            aria-label={messages.userList.newBadge}
          >
            {messages.userList.newBadge}
          </Badge>
        )}
      </Anchor>
    </Group>
  );
}

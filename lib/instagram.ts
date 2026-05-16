export type InstagramAnalysis = {
  followingCount: number;
  followersCount: number;
  followingUnique: number;
  followersUnique: number;
  /** Unique following minus unique followers. */
  netDifference: number;
  /** Unique followers ÷ unique following; null if following is 0. */
  followersRatio: number | null;
  mutuals: string[];
  youFollowTheyDont: string[];
  theyFollowYouDont: string[];
};

export function normalizeUsername(raw: string): string {
  const s = raw.trim().replace(/^@+/, "").toLowerCase();
  return s;
}

/** Instagram uses this prefix for removed accounts in some exports. */
function isDeletedPlaceholderUsername(normalized: string): boolean {
  return normalized.startsWith("__deleted__");
}

/** Profile URLs like /_u/handle or /handle — not /p/, /reel/, etc. */
function usernameFromInstagramHref(href: string): string | null {
  try {
    const parts = new URL(href).pathname.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    if (parts[0] === "_u" && parts[1]) return normalizeUsername(parts[1]);
    if (parts[0] === "p" || parts[0] === "reel" || parts[0] === "stories") return null;
    return normalizeUsername(parts[parts.length - 1]!) || null;
  } catch {
    return null;
  }
}

/**
 * Walks Instagram "Download your information" JSON and collects usernames.
 *
 * Shapes seen in exports:
 * - **Followers** (`followers_*.json`): array of blocks with `string_list_data[].value` (and often empty `title`).
 * - **Following** (`following.json`): `relationships_following` array; handle is in each block's `title`, while
 *   `string_list_data` may only have `href` + `timestamp` (no `value`).
 *
 * Usernames starting with `__deleted__` (after normalization) are omitted.
 */
export function extractUsernamesFromInstagramJson(data: unknown): string[] {
  const found: string[] = [];

  function visit(node: unknown): void {
    if (node === null || node === undefined) return;
    const t = typeof node;
    if (t === "string" || t === "number" || t === "boolean") return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    const o = node as Record<string, unknown>;
    const list = o.string_list_data;
    if (Array.isArray(list)) {
      const fromValues: string[] = [];
      for (const entry of list) {
        if (!entry || typeof entry !== "object") continue;
        const v = (entry as { value?: unknown }).value;
        if (typeof v === "string") {
          const u = normalizeUsername(v);
          if (u) fromValues.push(u);
        }
      }

      if (fromValues.length > 0) {
        found.push(...fromValues);
      } else {
        const title = typeof o.title === "string" ? normalizeUsername(o.title) : "";
        if (title) {
          found.push(title);
        } else {
          for (const entry of list) {
            if (!entry || typeof entry !== "object") continue;
            const href = (entry as { href?: unknown }).href;
            if (typeof href === "string") {
              const u = usernameFromInstagramHref(href);
              if (u) found.push(u);
            }
          }
        }
      }
    }

    for (const v of Object.values(o)) visit(v);
  }

  visit(data);
  return found.filter((u) => !isDeletedPlaceholderUsername(u));
}

export function analyzeFollowingFollowers(
  followingUsernames: string[],
  followerUsernames: string[],
): InstagramAnalysis {
  const followingSet = new Set(followingUsernames);
  const followersSet = new Set(followerUsernames);

  const mutuals: string[] = [];
  const youFollowTheyDont: string[] = [];
  const theyFollowYouDont: string[] = [];

  for (const u of followingSet) {
    if (followersSet.has(u)) mutuals.push(u);
    else youFollowTheyDont.push(u);
  }

  for (const u of followersSet) {
    if (!followingSet.has(u)) theyFollowYouDont.push(u);
  }

  mutuals.sort();
  youFollowTheyDont.sort();
  theyFollowYouDont.sort();

  const followingUnique = followingSet.size;
  const followersUnique = followersSet.size;

  return {
    followingCount: followingUsernames.length,
    followersCount: followerUsernames.length,
    followingUnique,
    followersUnique,
    netDifference: followersUnique - followingUnique,
    followersRatio: followingUnique === 0 ? null : followersUnique / followingUnique,
    mutuals,
    youFollowTheyDont,
    theyFollowYouDont,
  };
}

export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}

export type TimestampedUser = {
  username: string;
  timestamp: number;
};

/**
 * Extracts usernames with their associated timestamps from Instagram JSON exports.
 * The timestamp represents when the follow action occurred.
 */
export function extractTimestampedUsersFromInstagramJson(
  data: unknown,
): TimestampedUser[] {
  const found: TimestampedUser[] = [];

  function visit(node: unknown): void {
    if (node === null || node === undefined) return;
    const t = typeof node;
    if (t === "string" || t === "number" || t === "boolean") return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    const o = node as Record<string, unknown>;
    const list = o.string_list_data;
    if (Array.isArray(list)) {
      for (const entry of list) {
        if (!entry || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        const ts = typeof e.timestamp === "number" ? e.timestamp : 0;
        if (ts === 0) continue;

        let username = "";
        if (typeof e.value === "string") {
          username = normalizeUsername(e.value);
        }
        if (!username && typeof o.title === "string") {
          username = normalizeUsername(o.title);
        }
        if (!username && typeof e.href === "string") {
          const u = usernameFromInstagramHref(e.href);
          if (u) username = u;
        }

        if (username && !isDeletedPlaceholderUsername(username)) {
          found.push({ username, timestamp: ts });
        }
      }
    }

    for (const v of Object.values(o)) visit(v);
  }

  visit(data);
  return found;
}

export function diffSets(
  previous: ReadonlySet<string>,
  next: ReadonlySet<string>,
): { added: string[]; removed: string[] } {
  const added: string[] = [];
  const removed: string[] = [];
  for (const u of next) {
    if (!previous.has(u)) added.push(u);
  }
  for (const u of previous) {
    if (!next.has(u)) removed.push(u);
  }
  added.sort();
  removed.sort();
  return { added, removed };
}

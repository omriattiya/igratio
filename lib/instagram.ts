export type InstagramAnalysis = {
  followingCount: number;
  followersCount: number;
  followingUnique: number;
  followersUnique: number;
  mutuals: string[];
  youFollowTheyDont: string[];
  theyFollowYouDont: string[];
};

export function normalizeUsername(raw: string): string {
  const s = raw.trim().replace(/^@+/, "").toLowerCase();
  return s;
}

/**
 * Walks Instagram "Download your information" JSON and collects usernames from
 * every `string_list_data[].value` field (followers, following, close friends, etc.).
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
      for (const entry of list) {
        if (!entry || typeof entry !== "object") continue;
        const v = (entry as { value?: unknown }).value;
        if (typeof v === "string") {
          const u = normalizeUsername(v);
          if (u) found.push(u);
        }
      }
    }

    for (const v of Object.values(o)) visit(v);
  }

  visit(data);
  return found;
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

  return {
    followingCount: followingUsernames.length,
    followersCount: followerUsernames.length,
    followingUnique: followingSet.size,
    followersUnique: followersSet.size,
    mutuals,
    youFollowTheyDont,
    theyFollowYouDont,
  };
}

export async function readJsonFile(file: File): Promise<unknown> {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}

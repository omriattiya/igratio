import { unzipSync } from "fflate";
import { messages } from "@/lib/i18n";

/** Hard cap on Export Archive file size (bytes). */
export const EXPORT_ARCHIVE_MAX_BYTES = 20 * 1024 * 1024;

const FOLLOW_GRAPH_FOLDER = "connections/followers_and_following/";

export type ExtractedGraphFiles = {
  followingJsonTexts: string[];
  followersJsonTexts: string[];
  selectedBasenames: string[];
};

function normalizeZipPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function basename(path: string): string {
  const parts = normalizeZipPath(path).split("/");
  return parts[parts.length - 1] ?? path;
}

function isInFollowGraphFolder(normalizedPath: string): boolean {
  return normalizedPath.toLowerCase().includes(FOLLOW_GRAPH_FOLDER);
}

function isFollowingFile(name: string): boolean {
  return name.toLowerCase() === "following.json";
}

function isFollowersFile(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.startsWith("followers") && lower.endsWith(".json");
}

function decodeUtf8(data: Uint8Array): string {
  return new TextDecoder("utf-8").decode(data);
}

/**
 * Reads an Instagram Export Archive zip and returns allowlisted
 * following/followers JSON text under the Follow Graph Folder.
 */
export async function extractFollowGraphFromExportArchive(
  file: File,
): Promise<ExtractedGraphFiles> {
  if (file.size > EXPORT_ARCHIVE_MAX_BYTES) {
    throw new Error(messages.analyzer.errors.archiveTooLarge);
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".zip") && file.type !== "application/zip" && file.type !== "application/x-zip-compressed") {
    // Still try if the OS omits extension/MIME; only hard-reject obvious non-zips when named otherwise.
    if (file.name.includes(".") && !lowerName.endsWith(".zip")) {
      throw new Error(messages.analyzer.errors.notAZip);
    }
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new Error(messages.analyzer.errors.archiveReadFailed);
  }

  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(bytes, {
      filter(file) {
        const normalized = normalizeZipPath(file.name);
        if (!isInFollowGraphFolder(normalized) || normalized.endsWith("/")) {
          return false;
        }
        const name = basename(normalized);
        return isFollowingFile(name) || isFollowersFile(name);
      },
    });
  } catch {
    throw new Error(messages.analyzer.errors.archiveCorrupt);
  }

  const followingJsonTexts: string[] = [];
  const followersJsonTexts: string[] = [];
  const selectedBasenames: string[] = [];

  for (const [entryPath, data] of Object.entries(entries)) {
    const name = basename(normalizeZipPath(entryPath));
    if (isFollowingFile(name)) {
      followingJsonTexts.push(decodeUtf8(data));
      selectedBasenames.push(name);
    } else if (isFollowersFile(name)) {
      followersJsonTexts.push(decodeUtf8(data));
      selectedBasenames.push(name);
    }
  }

  if (followingJsonTexts.length === 0 || followersJsonTexts.length === 0) {
    throw new Error(messages.analyzer.errors.incompleteArchive);
  }

  selectedBasenames.sort((a, b) => a.localeCompare(b));
  return { followingJsonTexts, followersJsonTexts, selectedBasenames };
}

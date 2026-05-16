import type { InstagramAnalysis, TimestampedUser } from "@/lib/instagram";

const DB_NAME = "igratio";
const DB_VERSION = 1;

const STORE_META = "meta";
const STORE_UNFOLLOWER_OK = "unfollowerOk";
const STORE_SNAPSHOT = "snapshot";

const KEY_TRACK_SNAPSHOTS = "trackSnapshots";
const KEY_LATEST_SNAPSHOT = "latest";

export type TrackSnapshotsMeta = { enabled: boolean };

export type UnfollowerOkRecord = { markedAt: string };

/** Stored after each successful analyze; lists drive export diffs; analysis restores UI after refresh. */
export type ListsSnapshot = {
  following: string[];
  followers: string[];
  savedAt: string;
  analysis?: InstagramAnalysis;
  followerTimestamps?: TimestampedUser[];
  followingTimestamps?: TimestampedUser[];
};

function idbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!idbAvailable()) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("Failed to open IndexedDB"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
      if (!db.objectStoreNames.contains(STORE_UNFOLLOWER_OK)) {
        db.createObjectStore(STORE_UNFOLLOWER_OK);
      }
      if (!db.objectStoreNames.contains(STORE_SNAPSHOT)) {
        db.createObjectStore(STORE_SNAPSHOT);
      }
    };
  });
}

function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = fn(store);
        req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
        tx.oncomplete = () => resolve(req.result as T);
        tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
        tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
      }),
  );
}

export async function getTrackSnapshots(): Promise<boolean> {
  if (!idbAvailable()) return false;
  try {
    const row = (await withStore<TrackSnapshotsMeta | undefined>(
      STORE_META,
      "readonly",
      (s) => s.get(KEY_TRACK_SNAPSHOTS),
    )) as TrackSnapshotsMeta | undefined;
    return Boolean(row?.enabled);
  } catch {
    return false;
  }
}

export async function setTrackSnapshots(enabled: boolean): Promise<void> {
  if (!idbAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readwrite");
    tx.objectStore(STORE_META).put({ enabled } satisfies TrackSnapshotsMeta, KEY_TRACK_SNAPSHOTS);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save setting"));
  });
}

export async function getUnfollowerOkSet(): Promise<Set<string>> {
  if (!idbAvailable()) return new Set();
  try {
    const db = await openDb();
    return await new Promise<Set<string>>((resolve, reject) => {
      const set = new Set<string>();
      const tx = db.transaction(STORE_UNFOLLOWER_OK, "readonly");
      const req = tx.objectStore(STORE_UNFOLLOWER_OK).openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          set.add(String(cursor.key));
          cursor.continue();
        }
      };
      tx.oncomplete = () => resolve(set);
      tx.onerror = () => reject(tx.error ?? new Error("Failed to read OK marks"));
    });
  } catch {
    return new Set();
  }
}

export async function setUnfollowerOk(username: string, ok: boolean): Promise<void> {
  if (!idbAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_UNFOLLOWER_OK, "readwrite");
    const store = tx.objectStore(STORE_UNFOLLOWER_OK);
    if (ok) {
      store.put({ markedAt: new Date().toISOString() } satisfies UnfollowerOkRecord, username);
    } else {
      store.delete(username);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to update OK mark"));
  });
}

/** Remove OK entries for usernames not in the current don't-follow-back list. */
export async function pruneUnfollowerOk(validUsernames: Set<string>): Promise<void> {
  if (!idbAvailable()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_UNFOLLOWER_OK, "readwrite");
      const store = tx.objectStore(STORE_UNFOLLOWER_OK);
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return;
        const key = String(cursor.key);
        if (!validUsernames.has(key)) {
          cursor.delete();
        }
        cursor.continue();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Failed to prune OK marks"));
    });
  } catch {
    /* ignore */
  }
}

export async function getLatestSnapshot(): Promise<ListsSnapshot | null> {
  if (!idbAvailable()) return null;
  try {
    const row = (await withStore<ListsSnapshot | undefined>(
      STORE_SNAPSHOT,
      "readonly",
      (s) => s.get(KEY_LATEST_SNAPSHOT),
    )) as ListsSnapshot | undefined;
    if (!row || !Array.isArray(row.following) || !Array.isArray(row.followers)) return null;
    return row;
  } catch {
    return null;
  }
}

export async function setLatestSnapshot(snapshot: ListsSnapshot): Promise<void> {
  if (!idbAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SNAPSHOT, "readwrite");
    tx.objectStore(STORE_SNAPSHOT).put(snapshot, KEY_LATEST_SNAPSHOT);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save snapshot"));
  });
}

/** Clears all app data in IndexedDB (export snapshots, OK marks, tracking preference). */
export async function clearAllSiteData(): Promise<void> {
  if (!idbAvailable()) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(
      [STORE_META, STORE_UNFOLLOWER_OK, STORE_SNAPSHOT],
      "readwrite",
    );
    tx.objectStore(STORE_META).clear();
    tx.objectStore(STORE_UNFOLLOWER_OK).clear();
    tx.objectStore(STORE_SNAPSHOT).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to clear storage"));
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
  });
}

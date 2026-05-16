const DB_NAME = "since-db";
const DB_VERSION = 1;
const COUNTERS = "counters";
const ATTEMPTS = "attempts";
const SETTINGS = "settings";

let dbPromise;

function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(COUNTERS)) {
        db.createObjectStore(COUNTERS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(ATTEMPTS)) {
        const store = db.createObjectStore(ATTEMPTS, { keyPath: "id" });
        store.createIndex("counterId", "counterId");
      }

      if (!db.objectStoreNames.contains(SETTINGS)) {
        db.createObjectStore(SETTINGS, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

function transact(storeName, mode, action) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = action(store);

        tx.oncomplete = () => resolve(request?.result);
        tx.onerror = () => reject(tx.error);
      })
  );
}

function getAll(storeName) {
  return transact(storeName, "readonly", (store) => store.getAll());
}

export async function loadDatabase() {
  const [counters, attempts, settingsRows] = await Promise.all([
    getAll(COUNTERS),
    getAll(ATTEMPTS),
    getAll(SETTINGS)
  ]);

  const settings = settingsRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
  return { counters, attempts, settings };
}

export function saveCounter(counter) {
  return transact(COUNTERS, "readwrite", (store) => store.put(counter));
}

export function deleteCounterRecord(counterId) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction([COUNTERS, ATTEMPTS], "readwrite");
        tx.objectStore(COUNTERS).delete(counterId);
        const attemptIndex = tx.objectStore(ATTEMPTS).index("counterId");
        const request = attemptIndex.openCursor(IDBKeyRange.only(counterId));

        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      })
  );
}

export function saveAttempt(attempt) {
  return transact(ATTEMPTS, "readwrite", (store) => store.put(attempt));
}

export function saveSetting(key, value) {
  return transact(SETTINGS, "readwrite", (store) => store.put({ key, value }));
}

export async function replaceDatabase(payload) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([COUNTERS, ATTEMPTS, SETTINGS], "readwrite");
    tx.objectStore(COUNTERS).clear();
    tx.objectStore(ATTEMPTS).clear();
    tx.objectStore(SETTINGS).clear();

    payload.counters?.forEach((counter) => tx.objectStore(COUNTERS).put(counter));
    payload.attempts?.forEach((attempt) => tx.objectStore(ATTEMPTS).put(attempt));
    Object.entries(payload.settings || {}).forEach(([key, value]) => tx.objectStore(SETTINGS).put({ key, value }));

    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

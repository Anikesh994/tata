/**
 * exportStorage.js
 *
 * Tiny IndexedDB wrapper that stores PDF blobs locally, keyed by the
 * export's MongoDB _id.  This avoids sending large payloads to the server.
 */

const DB_NAME    = "insightboard_exports";
const STORE_NAME = "pdfs";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/** Save a base64 data-URI string under a given id key */
export async function savePdfLocally(id, dataUri) {
  const db  = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(dataUri, id);
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

/** Retrieve a base64 data-URI string by id, or null if not found */
export async function getPdfLocally(id) {
  const db  = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/** Delete a stored PDF by id */
export async function deletePdfLocally(id) {
  const db  = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

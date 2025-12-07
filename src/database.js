import wasmURL from "sql.js/dist/sql-wasm.wasm?url";
import initSqlJs from "sql.js";

export const DATABASE_FILE_NAME = "database.sqlite";
export const DATABASE_TABLE = "test";

/**
 * Initialize sql.js with local database
 * @returns
 */
export async function init() {
  const db = await initSqlJs({ locateFile: () => wasmURL }).then(load);
  // Persist database as file via an update hook,
  // can be done less frequent as well, for instance on visibilitychange
  db.updateHook((_, db) => persist(db));
  return db;
}

/**
 * Load local database
 *
 * @param {import("sql.js").SqlJsStatic} SQL
 * @returns {import("sql.js").Database}
 */
async function load(SQL) {
  const file = await getFileContents();
  const db = new SQL.Database(file);
  // Create database you want to use
  db.run(`CREATE TABLE IF NOT EXISTS ${DATABASE_TABLE} (a int, b char);`);
  // Example insert to show behavior
  db.run(`INSERT INTO ${DATABASE_TABLE} VALUES (0, 'hello');`);
  db.run(`INSERT INTO ${DATABASE_TABLE} VALUES (1, 'world');`);
  await persist(db);
  return db;
}

/**
 * Helper to get file handle for database file
 */
async function getFileHandle() {
  return navigator.storage
    .getDirectory()
    .then((dir) => dir.getFileHandle(DATABASE_FILE_NAME, { create: true }));
}

/**
 * Load SQLite file from origin private file system.
 * Create file if none exists.
 */
async function getFileContents() {
  const data = await getFileHandle()
    .then((handle) => handle.getFile())
    .then((file) => file.bytes());
  return data;
}

/**
 * Persist database data to origin private file system
 *
 * @param {import("sql.js").Database} db
 */
export async function persist(db) {
  const data = db.export();
  const handle = await getFileHandle();
  const writable = await handle.createWritable();
  await writable.write({ type: "write", data, position: 0 });
  await writable.close();
}

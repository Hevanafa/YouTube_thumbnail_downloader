import { Database } from "bun:sqlite";

export const instance = new Database("thumbnails.db");

export function initDatabase() {
  console.log("initDatabase call");

  instance.run(`
CREATE TABLE IF NOT EXISTS thumbnails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  filename TEXT NOT NULL
)
  `);
}

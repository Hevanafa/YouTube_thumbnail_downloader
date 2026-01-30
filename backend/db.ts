import { Database } from "bun:sqlite";

const db = new Database("thumbnails.db");

db.run(`
CREATE TABLE IF NOT EXISTS thumbnails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  filename TEXT NOT NULL
)
`);

export default db

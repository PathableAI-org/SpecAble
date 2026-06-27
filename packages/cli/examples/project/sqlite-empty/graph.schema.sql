-- graph-schema 1 — empty graph bootstrap
-- Keep in sync with packages/core/src/storage/SqliteStorageBackend.ts createTables()

CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS primitives (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload TEXT NOT NULL
);

INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('graph-schema', '1');

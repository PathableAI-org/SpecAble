import * as Reactivity from "@effect/experimental/Reactivity"
import { make as makeSqliteClient } from "@effect/sql-sqlite-node/SqliteClient"
import { Effect } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

const GRAPH_SCHEMA_KEY = "graph-schema"
const GRAPH_SCHEMA_VERSION = "1"
const SCHEMA_SQL_FILE = "graph.schema.sql"
const SPECABLE_JSON = "specable.json"

const stripSqlComments = (sql: string): string => sql.replace(/--[^\n]*/g, "").trim()

const parseSqlStatements = (sql: string): readonly string[] =>
  stripSqlComments(sql)
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)

const readStorageLocation = async (projectRoot: string): Promise<string> => {
  const manifestPath = path.join(projectRoot, SPECABLE_JSON)
  const content = await fs.readFile(manifestPath, "utf8")
  const parsed = JSON.parse(content) as { storage?: { location?: string } }
  const location = parsed.storage?.location

  if (location === undefined || location.length === 0) {
    throw new Error(`Missing storage.location in ${manifestPath}`)
  }

  return location
}

const materializeEffect = (projectRoot: string) =>
  Effect.scoped(
    Effect.gen(function*() {
      const schemaPath = path.join(projectRoot, SCHEMA_SQL_FILE)

      const schemaSql = yield* Effect.tryPromise({
        catch: (error) => new Error(`Failed to read ${schemaPath}: ${String(error)}`),
        try: () => fs.readFile(schemaPath, "utf8")
      })

      const storageLocation = yield* Effect.tryPromise({
        catch: (error) => new Error(`Failed to read ${path.join(projectRoot, SPECABLE_JSON)}: ${String(error)}`),
        try: () => readStorageLocation(projectRoot)
      })

      const dbPath = path.join(projectRoot, storageLocation)

      yield* Effect.tryPromise({
        catch: (error) => new Error(`Failed to remove existing ${dbPath}: ${String(error)}`),
        try: () => fs.rm(dbPath, { force: true })
      })

      const sql = yield* makeSqliteClient({ filename: dbPath })

      for (const statement of parseSqlStatements(schemaSql)) {
        yield* sql.unsafe(statement)
      }

      const schemaRows = yield* sql<{ readonly value: string }>`
        SELECT value FROM schema_meta WHERE key = ${GRAPH_SCHEMA_KEY}
      `

      if (schemaRows.length !== 1 || schemaRows[0]?.value !== GRAPH_SCHEMA_VERSION) {
        return yield* Effect.fail(
          new Error("SQLite schema_meta missing graph-schema version row after applying graph.schema.sql")
        )
      }

      const countRows = yield* sql<{ readonly count: number }>`
        SELECT COUNT(*) AS count FROM primitives
      `
      const total = Number(countRows[0]?.count ?? 0)

      if (total !== 0) {
        return yield* Effect.fail(
          new Error(`Expected empty primitives table after applying graph.schema.sql, found ${total} rows`)
        )
      }

      return dbPath
    })
  ).pipe(Effect.provide(Reactivity.layer))

/** Materialize graph.sqlite from graph.schema.sql for a committed example project root. */
export const materializeSqliteFromSchema = (projectRoot: string): Promise<string> =>
  Effect.runPromise(materializeEffect(path.resolve(projectRoot)))

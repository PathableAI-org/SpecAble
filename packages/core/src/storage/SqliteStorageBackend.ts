import type * as SqlClient from "@effect/sql/SqlClient"

import * as Reactivity from "@effect/experimental/Reactivity"
import * as FileSystem from "@effect/platform/FileSystem"
import { make as makeSqliteClient } from "@effect/sql-sqlite-node/SqliteClient"
import { Effect, Layer } from "effect"
import * as path from "node:path"

import type { ProjectConfig } from "../project/ProjectConfig.js"

import { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import { emptyGraphStoreSummary, type GraphStoreSummary } from "../project/ProjectDescriptor.js"
import { StorageBackend, type StorageBackendService } from "./StorageBackend.js"

const GRAPH_SCHEMA_KEY = "graph-schema"
const GRAPH_SCHEMA_VERSION = "1"

const createTables = (sql: SqlClient.SqlClient) =>
  Effect.gen(function*() {
    yield* sql`
      CREATE TABLE IF NOT EXISTS schema_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `
    yield* sql`
      CREATE TABLE IF NOT EXISTS primitives (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT NOT NULL
      )
    `
    yield* sql`
      INSERT OR REPLACE INTO schema_meta (key, value)
      VALUES (${GRAPH_SCHEMA_KEY}, ${GRAPH_SCHEMA_VERSION})
    `
  })

const withSqliteClient = <A, E>(
  filename: string,
  program: (sql: SqlClient.SqlClient) => Effect.Effect<A, E>
): Effect.Effect<A, E> =>
  Effect.scoped(
    Effect.gen(function*() {
      const client = yield* makeSqliteClient({ filename })

      return yield* program(client)
    })
  ).pipe(Effect.provide(Reactivity.layer))

const resolveDatabasePath = (projectRoot: string, config: ProjectConfig): string =>
  path.join(projectRoot, config.storage.location)

const summarizeSqliteDatabase = (
  sql: SqlClient.SqlClient,
  dbPath: string
): Effect.Effect<GraphStoreSummary, IncompleteProjectError> =>
  Effect.gen(function*() {
    const schemaRows = yield* sql<{ readonly value: string }>`
      SELECT value FROM schema_meta WHERE key = ${GRAPH_SCHEMA_KEY}
    `

    if (schemaRows.length !== 1 || schemaRows[0]?.value !== GRAPH_SCHEMA_VERSION) {
      return yield* Effect.fail(
        new IncompleteProjectError({
          message: "SQLite schema_meta missing graph-schema version row",
          path: dbPath
        })
      )
    }

    const countRows = yield* sql<{ readonly count: number }>`
      SELECT COUNT(*) AS count FROM primitives
    `
    const total = Number(countRows[0]?.count ?? 0)

    if (total !== 0) {
      return yield* Effect.fail(
        new IncompleteProjectError({
          message: `Expected empty primitives table, found ${total} rows`,
          path: dbPath
        })
      )
    }

    return emptyGraphStoreSummary()
  }).pipe(
    Effect.mapError((cause) =>
      cause instanceof IncompleteProjectError
        ? cause
        : new IncompleteProjectError({
          message: `Failed to query SQLite database: ${String(cause)}`,
          path: dbPath
        })
    )
  )

const mapSqliteDescribeError = (projectRoot: string) => (cause: unknown) => {
  if (cause instanceof IncompleteProjectError) {
    return cause
  }

  return new IncompleteProjectError({
    message: `Failed to describe SQLite database: ${String(cause)}`,
    path: projectRoot
  })
}

export const makeSqliteStorageBackend = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem

  const bootstrap: StorageBackendService["bootstrap"] = (projectRoot, config) =>
    withSqliteClient(
      resolveDatabasePath(projectRoot, config),
      (sql) =>
        Effect.gen(function*() {
          if (config.storage.type !== "sqlite") {
            return yield* Effect.fail(
              new StorageBootstrapError({
                message: `SQLite backend cannot bootstrap storage type "${config.storage.type}"`,
                path: projectRoot
              })
            )
          }

          yield* createTables(sql)
        })
    ).pipe(
      Effect.mapError((cause) => {
        if (cause instanceof StorageBootstrapError) {
          return cause
        }

        return new StorageBootstrapError({
          message: `Failed to bootstrap SQLite database: ${String(cause)}`,
          path: projectRoot
        })
      })
    )

  const describe: StorageBackendService["describe"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "sqlite") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `SQLite backend cannot describe storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const dbPath = resolveDatabasePath(projectRoot, config)
      const exists = yield* fs.exists(dbPath)

      if (!exists) {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Missing SQLite database: ${config.storage.location}`,
            path: projectRoot
          })
        )
      }

      return yield* withSqliteClient(dbPath, (sql) => summarizeSqliteDatabase(sql, dbPath)).pipe(
        Effect.mapError(mapSqliteDescribeError(projectRoot))
      )
    })

  return { bootstrap, describe } satisfies StorageBackendService
})

export const SqliteStorageBackendLive = Layer.effect(StorageBackend, makeSqliteStorageBackend)

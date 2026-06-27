import type * as SqlClient from "@effect/sql/SqlClient"
import type { Primitive } from "@specable/domain"

import * as Reactivity from "@effect/experimental/Reactivity"
import * as FileSystem from "@effect/platform/FileSystem"
import { make as makeSqliteClient } from "@effect/sql-sqlite-node/SqliteClient"
import { Effect, Layer } from "effect"
import * as path from "node:path"

import type { PrimitiveSummary } from "../primitive/PrimitiveSummary.js"
import type { ProjectConfig } from "../project/ProjectConfig.js"

import { DuplicatePrimitiveIdError, PrimitiveNotFoundError, type StorageReadError } from "../primitive/errors.js"
import { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import { emptyCountsByType, type GraphStoreSummary } from "../project/ProjectDescriptor.js"
import { decodePrimitiveUnknown, summaryFromPrimitive } from "./PrimitiveSchemas.js"
import { CANONICAL_PRIMITIVE_TYPES, type CanonicalPrimitiveType } from "./PrimitiveTypes.js"
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

const buildGraphStoreSummary = (counts: GraphStoreSummary["countsByType"]): GraphStoreSummary => {
  const totalPrimitives = CANONICAL_PRIMITIVE_TYPES.reduce((total, type) => total + counts[type], 0)

  return {
    countsByType: counts,
    empty: totalPrimitives === 0,
    totalPrimitives
  }
}

const isSqliteConstraintError = (cause: unknown): boolean =>
  typeof cause === "object" &&
  cause !== null &&
  "message" in cause &&
  typeof cause.message === "string" &&
  cause.message.toLowerCase().includes("unique")

const mapSqliteDescribeError = (projectRoot: string) => (cause: unknown) => {
  if (cause instanceof IncompleteProjectError) {
    return cause
  }

  return new IncompleteProjectError({
    message: `Failed to describe SQLite database: ${String(cause)}`,
    path: projectRoot
  })
}

const requireSqliteStorage = (
  projectRoot: string,
  config: ProjectConfig,
  operation: string
): Effect.Effect<void, IncompleteProjectError> =>
  config.storage.type === "sqlite"
    ? Effect.void
    : Effect.fail(
      new IncompleteProjectError({
        message: `SQLite backend cannot ${operation} storage type "${config.storage.type}"`,
        path: projectRoot
      })
    )

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

    const countRows = yield* sql<{ readonly count: number; readonly type: string }>`
      SELECT type, COUNT(*) AS count FROM primitives GROUP BY type
    `
    const counts = { ...emptyCountsByType() }

    for (const row of countRows) {
      if ((CANONICAL_PRIMITIVE_TYPES as readonly string[]).includes(row.type)) {
        counts[row.type as CanonicalPrimitiveType] = Number(row.count)
      }
    }

    return buildGraphStoreSummary(counts)
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

const decodePayload = (
  dbPath: string,
  type: CanonicalPrimitiveType,
  payload: string
): Effect.Effect<Primitive, StorageReadError> =>
  Effect.gen(function*() {
    const parsed = yield* Effect.try({
      catch: (cause) =>
        new IncompleteProjectError({
          message: cause instanceof Error ? cause.message : "Invalid JSON payload",
          path: dbPath
        }),
      try: () => JSON.parse(payload) as unknown
    })

    return yield* decodePrimitiveUnknown(type, dbPath, parsed)
  })

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
      yield* requireSqliteStorage(projectRoot, config, "describe")

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

  const create: StorageBackendService["create"] = (projectRoot, config, primitive) =>
    Effect.gen(function*() {
      yield* requireSqliteStorage(projectRoot, config, "create")

      const dbPath = resolveDatabasePath(projectRoot, config)

      yield* withSqliteClient(dbPath, (sql) =>
        sql`
          INSERT INTO primitives (id, type, payload)
          VALUES (${primitive.id}, ${primitive.type}, ${JSON.stringify(primitive)})
        `).pipe(
          Effect.mapError((cause) => {
            if (isSqliteConstraintError(cause)) {
              return new DuplicatePrimitiveIdError({
                id: primitive.id,
                path: projectRoot
              })
            }

            return cause instanceof IncompleteProjectError
              ? cause
              : new IncompleteProjectError({
                message: `Failed to insert primitive: ${String(cause)}`,
                path: dbPath
              })
          })
        )
    })

  const list: StorageBackendService["list"] = (projectRoot, config, filter) =>
    Effect.gen(function*() {
      yield* requireSqliteStorage(projectRoot, config, "list")

      const dbPath = resolveDatabasePath(projectRoot, config)

      return yield* withSqliteClient(dbPath, (sql) =>
        Effect.gen(function*() {
          const rows = filter?.type === undefined
            ? yield* sql<{ readonly id: string; readonly payload: string; readonly type: string }>`
                SELECT id, type, payload FROM primitives ORDER BY type, id
              `
            : yield* sql<{ readonly id: string; readonly payload: string; readonly type: string }>`
                SELECT id, type, payload FROM primitives WHERE type = ${filter.type} ORDER BY type, id
              `

          const summaries: PrimitiveSummary[] = []

          for (const row of rows) {
            const primitive = yield* decodePayload(
              dbPath,
              row.type as CanonicalPrimitiveType,
              row.payload
            )
            summaries.push(summaryFromPrimitive(primitive))
          }

          return summaries
        })).pipe(
          Effect.mapError((cause) =>
            cause instanceof IncompleteProjectError || cause instanceof DuplicatePrimitiveIdError
              ? cause
              : new IncompleteProjectError({
                message: `Failed to list primitives: ${String(cause)}`,
                path: dbPath
              })
          )
        )
    })

  const get: StorageBackendService["get"] = (projectRoot, config, id) =>
    Effect.gen(function*() {
      yield* requireSqliteStorage(projectRoot, config, "get")

      const dbPath = resolveDatabasePath(projectRoot, config)

      return yield* withSqliteClient(dbPath, (sql) =>
        Effect.gen(function*() {
          const rows = yield* sql<{ readonly payload: string; readonly type: string }>`
            SELECT type, payload FROM primitives WHERE id = ${id} LIMIT 1
          `

          const row = rows[0]

          if (row === undefined) {
            return yield* Effect.fail(
              new PrimitiveNotFoundError({
                id,
                path: projectRoot
              })
            )
          }

          return yield* decodePayload(dbPath, row.type as CanonicalPrimitiveType, row.payload)
        })).pipe(
          Effect.mapError((cause) =>
            cause instanceof IncompleteProjectError ||
              cause instanceof PrimitiveNotFoundError ||
              cause instanceof DuplicatePrimitiveIdError
              ? cause
              : new IncompleteProjectError({
                message: `Failed to get primitive: ${String(cause)}`,
                path: dbPath
              })
          )
        )
    })

  return { bootstrap, create, describe, get, list } satisfies StorageBackendService
})

export const SqliteStorageBackendLive = Layer.effect(StorageBackend, makeSqliteStorageBackend)

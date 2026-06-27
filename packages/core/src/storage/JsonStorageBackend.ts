import type { PlatformError } from "@effect/platform/Error"

import * as FileSystem from "@effect/platform/FileSystem"
import { Schema } from "@effect/schema"
import { Effect, Layer } from "effect"
import { randomUUID } from "node:crypto"
import * as path from "node:path"

import type { PrimitiveSummary } from "../primitive/PrimitiveSummary.js"

import { DuplicatePrimitiveIdError, PrimitiveNotFoundError, type StorageReadError } from "../primitive/errors.js"
import { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import { emptyCountsByType, type GraphStoreSummary } from "../project/ProjectDescriptor.js"
import { decodePrimitiveUnknown, summaryFromPrimitive } from "./PrimitiveSchemas.js"
import {
  ALPHA_PRIMITIVE_TYPE_FILE_ENTRIES,
  CANONICAL_PRIMITIVE_TYPES,
  type CanonicalPrimitiveType,
  PRIMITIVE_TYPE_FILE_ENTRIES,
  PRIMITIVE_TYPE_FILES
} from "./PrimitiveTypes.js"
import { decodeJsonContent } from "./SchemaDecode.js"
import { type PrimitiveListFilter, StorageBackend, type StorageBackendService } from "./StorageBackend.js"

export const GRAPH_METADATA_FILE = "graph.json"

const EmptyPrimitiveFileSchema = Schema.Struct({
  primitives: Schema.Array(Schema.Unknown)
})

const GraphMetadataSchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  schemaVersion: Schema.Literal(1)
})

const EMPTY_PRIMITIVE_FILE = `${JSON.stringify({ primitives: [] })}\n`

const entriesForFilter = (filter?: PrimitiveListFilter) =>
  filter?.type === undefined
    ? ALPHA_PRIMITIVE_TYPE_FILE_ENTRIES
    : ALPHA_PRIMITIVE_TYPE_FILE_ENTRIES.filter(({ type }) => type === filter.type)

const readPrimitiveEnvelope = (
  filePath: string,
  content: string
): Effect.Effect<{ readonly primitives: readonly unknown[] }, IncompleteProjectError> =>
  decodeJsonContent(
    filePath,
    EmptyPrimitiveFileSchema,
    content,
    `Invalid primitive file: ${path.basename(filePath)}`
  )

const extractId = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null || !("id" in value)) {
    return undefined
  }

  const id = value.id

  return typeof id === "string" ? id : undefined
}

const buildGraphStoreSummary = (counts: GraphStoreSummary["countsByType"]): GraphStoreSummary => {
  const totalPrimitives = CANONICAL_PRIMITIVE_TYPES.reduce((total, type) => total + counts[type], 0)

  return {
    countsByType: counts,
    empty: totalPrimitives === 0,
    totalPrimitives
  }
}

export const makeJsonStorageBackend = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem

  const writeEmptyTypeFiles = (projectRoot: string): Effect.Effect<void, PlatformError> =>
    Effect.forEach(
      PRIMITIVE_TYPE_FILE_ENTRIES,
      ({ fileName }) => {
        const filePath = path.join(projectRoot, fileName)

        return fs.writeFileString(filePath, EMPTY_PRIMITIVE_FILE)
      },
      { discard: true }
    )

  const writeGraphMetadata = (projectRoot: string, name: string): Effect.Effect<void, PlatformError> =>
    fs.writeFileString(
      path.join(projectRoot, GRAPH_METADATA_FILE),
      `${JSON.stringify({ name, schemaVersion: 1 })}\n`
    )

  const writeFileAtomically = (filePath: string, content: string): Effect.Effect<void, PlatformError> =>
    Effect.gen(function*() {
      const tempPath = `${filePath}.${randomUUID()}.tmp`

      yield* fs.writeFileString(tempPath, content)
      yield* fs.rename(tempPath, filePath)
    })

  const readTypeFile = (
    projectRoot: string,
    type: CanonicalPrimitiveType
  ): Effect.Effect<readonly unknown[], IncompleteProjectError | PlatformError> =>
    Effect.gen(function*() {
      const filePath = path.join(projectRoot, PRIMITIVE_TYPE_FILES[type])
      const exists = yield* fs.exists(filePath)

      if (!exists) {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Missing primitive file: ${PRIMITIVE_TYPE_FILES[type]}`,
            path: filePath
          })
        )
      }

      const content = yield* fs.readFileString(filePath)

      return (yield* readPrimitiveEnvelope(filePath, content)).primitives
    })

  const countPrimitivesInFile = (
    filePath: string
  ): Effect.Effect<number, IncompleteProjectError | PlatformError> =>
    Effect.gen(function*() {
      const exists = yield* fs.exists(filePath)

      if (!exists) {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Missing primitive file: ${path.basename(filePath)}`,
            path: filePath
          })
        )
      }

      const content = yield* fs.readFileString(filePath)

      return (yield* readPrimitiveEnvelope(filePath, content)).primitives.length
    })

  const primitiveIdExists = (
    projectRoot: string,
    id: string
  ): Effect.Effect<boolean, IncompleteProjectError | PlatformError> =>
    Effect.gen(function*() {
      for (const { type } of PRIMITIVE_TYPE_FILE_ENTRIES) {
        const entries = yield* readTypeFile(projectRoot, type)

        if (entries.some((entry) => extractId(entry) === id)) {
          return true
        }
      }

      return false
    })

  const bootstrap: StorageBackendService["bootstrap"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "json") {
        return yield* Effect.fail(
          new StorageBootstrapError({
            message: `JSON backend cannot bootstrap storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      yield* writeEmptyTypeFiles(projectRoot).pipe(
        Effect.mapError(
          (cause) =>
            new StorageBootstrapError({
              message: `Failed to write JSON primitive files: ${String(cause)}`,
              path: projectRoot
            })
        )
      )

      yield* writeGraphMetadata(projectRoot, config.name).pipe(
        Effect.mapError(
          (cause) =>
            new StorageBootstrapError({
              message: `Failed to write graph.json metadata: ${String(cause)}`,
              path: projectRoot
            })
        )
      )
    })

  const describe: StorageBackendService["describe"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "json") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `JSON backend cannot describe storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const counts = { ...emptyCountsByType() }

      for (const { fileName, type } of PRIMITIVE_TYPE_FILE_ENTRIES) {
        counts[type] = yield* countPrimitivesInFile(path.join(projectRoot, fileName))
      }

      const metadataPath = path.join(projectRoot, GRAPH_METADATA_FILE)
      const metadataExists = yield* fs.exists(metadataPath)

      if (metadataExists) {
        const metadataContent = yield* fs.readFileString(metadataPath)

        yield* decodeJsonContent(metadataPath, GraphMetadataSchema, metadataContent, "Invalid graph.json metadata")
      }

      return buildGraphStoreSummary(counts)
    })

  const create: StorageBackendService["create"] = (projectRoot, config, primitive) =>
    Effect.gen(function*() {
      if (config.storage.type !== "json") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `JSON backend cannot create in storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const duplicate = yield* primitiveIdExists(projectRoot, primitive.id)

      if (duplicate) {
        return yield* Effect.fail(
          new DuplicatePrimitiveIdError({
            id: primitive.id,
            path: projectRoot
          })
        )
      }

      const type = primitive.type
      const filePath = path.join(projectRoot, PRIMITIVE_TYPE_FILES[type])
      const entries = yield* readTypeFile(projectRoot, type)
      const nextContent = `${JSON.stringify({ primitives: [...entries, primitive] }, null, 2)}\n`

      yield* writeFileAtomically(filePath, nextContent)
    })

  const summariesForType = (
    projectRoot: string,
    type: CanonicalPrimitiveType
  ): Effect.Effect<readonly PrimitiveSummary[], StorageReadError> =>
    Effect.gen(function*() {
      const filePath = path.join(projectRoot, PRIMITIVE_TYPE_FILES[type])
      const entries = yield* readTypeFile(projectRoot, type)
      const summaries: PrimitiveSummary[] = []

      for (const entry of entries) {
        const primitive = yield* decodePrimitiveUnknown(type, filePath, entry)
        summaries.push(summaryFromPrimitive(primitive))
      }

      return summaries
    })

  const list: StorageBackendService["list"] = (projectRoot, config, filter) =>
    Effect.gen(function*() {
      if (config.storage.type !== "json") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `JSON backend cannot list storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const summaries: PrimitiveSummary[] = []

      for (const { type } of entriesForFilter(filter)) {
        const typeSummaries = yield* summariesForType(projectRoot, type)

        for (const summary of typeSummaries) {
          summaries.push(summary)
        }
      }

      return summaries
    })

  const get: StorageBackendService["get"] = (projectRoot, config, id) =>
    Effect.gen(function*() {
      if (config.storage.type !== "json") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `JSON backend cannot get from storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      for (const { type } of PRIMITIVE_TYPE_FILE_ENTRIES) {
        const filePath = path.join(projectRoot, PRIMITIVE_TYPE_FILES[type])
        const entries = yield* readTypeFile(projectRoot, type)

        for (const entry of entries) {
          if (extractId(entry) !== id) {
            continue
          }

          return yield* decodePrimitiveUnknown(type, filePath, entry)
        }
      }

      return yield* Effect.fail(
        new PrimitiveNotFoundError({
          id,
          path: projectRoot
        })
      )
    })

  return { bootstrap, create, describe, get, list } satisfies StorageBackendService
})

export const JsonStorageBackendLive = Layer.effect(StorageBackend, makeJsonStorageBackend)

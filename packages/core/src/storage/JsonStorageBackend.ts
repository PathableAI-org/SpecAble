import type { PlatformError } from "@effect/platform/Error"

import * as FileSystem from "@effect/platform/FileSystem"
import { Schema } from "@effect/schema"
import { Effect, Layer } from "effect"
import * as path from "node:path"

import { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import { emptyGraphStoreSummary } from "../project/ProjectDescriptor.js"
import { PRIMITIVE_TYPE_FILE_ENTRIES } from "./PrimitiveTypes.js"
import { StorageBackend, type StorageBackendService } from "./StorageBackend.js"

export const GRAPH_METADATA_FILE = "graph.json"

const EmptyPrimitiveFileSchema = Schema.Struct({
  primitives: Schema.Array(Schema.Unknown)
})

const GraphMetadataSchema = Schema.Struct({
  name: Schema.optional(Schema.String),
  schemaVersion: Schema.Literal(1)
})

const EMPTY_PRIMITIVE_FILE = `${JSON.stringify({ primitives: [] })}\n`

const writeEmptyTypeFiles = (
  fs: FileSystem.FileSystem,
  projectRoot: string
): Effect.Effect<void, PlatformError> =>
  Effect.forEach(
    PRIMITIVE_TYPE_FILE_ENTRIES,
    ({ fileName }) => {
      const filePath = path.join(projectRoot, fileName)

      return fs.writeFileString(filePath, EMPTY_PRIMITIVE_FILE)
    },
    { discard: true }
  )

const writeGraphMetadata = (
  fs: FileSystem.FileSystem,
  projectRoot: string,
  name: string
): Effect.Effect<void, PlatformError> =>
  fs.writeFileString(
    path.join(projectRoot, GRAPH_METADATA_FILE),
    `${JSON.stringify({ name, schemaVersion: 1 })}\n`
  )

const readEmptyPrimitiveFile = (
  fs: FileSystem.FileSystem,
  filePath: string
): Effect.Effect<void, IncompleteProjectError | PlatformError> =>
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
    const decoded = Schema.decodeUnknownEither(EmptyPrimitiveFileSchema)(JSON.parse(content))

    if (decoded._tag === "Left") {
      return yield* Effect.fail(
        new IncompleteProjectError({
          message: `Invalid empty primitive file: ${path.basename(filePath)}`,
          path: filePath
        })
      )
    }

    if (decoded.right.primitives.length !== 0) {
      return yield* Effect.fail(
        new IncompleteProjectError({
          message: `Expected empty primitives array in ${path.basename(filePath)}`,
          path: filePath
        })
      )
    }
  })

export const makeJsonStorageBackend = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem

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

      yield* writeEmptyTypeFiles(fs, projectRoot).pipe(
        Effect.mapError(
          (cause) =>
            new StorageBootstrapError({
              message: `Failed to write JSON primitive files: ${String(cause)}`,
              path: projectRoot
            })
        )
      )

      yield* writeGraphMetadata(fs, projectRoot, config.name).pipe(
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

      yield* Effect.forEach(
        PRIMITIVE_TYPE_FILE_ENTRIES,
        ({ fileName }) => readEmptyPrimitiveFile(fs, path.join(projectRoot, fileName)),
        { discard: true }
      )

      const metadataPath = path.join(projectRoot, GRAPH_METADATA_FILE)
      const metadataExists = yield* fs.exists(metadataPath)

      if (metadataExists) {
        const metadataContent = yield* fs.readFileString(metadataPath)
        const metadata = Schema.decodeUnknownEither(GraphMetadataSchema)(JSON.parse(metadataContent))

        if (metadata._tag === "Left") {
          return yield* Effect.fail(
            new IncompleteProjectError({
              message: "Invalid graph.json metadata",
              path: metadataPath
            })
          )
        }
      }

      return emptyGraphStoreSummary()
    })

  return { bootstrap, describe } satisfies StorageBackendService
})

export const JsonStorageBackendLive = Layer.effect(StorageBackend, makeJsonStorageBackend)

import type { PlatformError } from "@effect/platform/Error"

import * as FileSystem from "@effect/platform/FileSystem"
import { Effect, Layer } from "effect"
import * as path from "node:path"

import type { StorageBackendService } from "./StorageBackend.js"

import { StorageBootstrapError } from "../project/errors.js"
import { StorageBackend } from "./StorageBackend.js"
import { WIKI_TYPE_DIRECTORY_ENTRIES } from "./wiki-file-layout.js"

export const makeMarkdownStorageBackend = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem

  const createTypeDirectories = (
    projectRoot: string
  ): Effect.Effect<void, PlatformError> =>
    Effect.forEach(
      WIKI_TYPE_DIRECTORY_ENTRIES,
      (entry) => {
        const dirPath = path.join(projectRoot, entry.directoryName)

        return fs.makeDirectory(dirPath, { recursive: true })
      },
      { discard: true }
    )

  const bootstrap: StorageBackendService["bootstrap"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "md") {
        return yield* Effect.fail(
          new StorageBootstrapError({
            message: `Markdown backend cannot bootstrap storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      yield* createTypeDirectories(projectRoot).pipe(
        Effect.mapError(
          (cause) =>
            new StorageBootstrapError({
              message: `Failed to create wiki type directories: ${String(cause)}`,
              path: projectRoot
            })
        )
      )
    })

  const create: StorageBackendService["create"] = () => Effect.dieMessage("Markdown create not yet implemented")

  const describe: StorageBackendService["describe"] = () => Effect.dieMessage("Markdown describe not yet implemented")

  const get: StorageBackendService["get"] = () => Effect.dieMessage("Markdown get not yet implemented")

  const list: StorageBackendService["list"] = () => Effect.dieMessage("Markdown list not yet implemented")

  return { bootstrap, create, describe, get, list } satisfies StorageBackendService
})

export const MarkdownStorageBackendLive = Layer.effect(StorageBackend, makeMarkdownStorageBackend)

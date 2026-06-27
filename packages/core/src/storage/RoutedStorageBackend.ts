import { Effect, Layer } from "effect"

import { makeJsonStorageBackend } from "./JsonStorageBackend.js"
import { makeSqliteStorageBackend } from "./SqliteStorageBackend.js"
import { StorageBackend, type StorageBackendService } from "./StorageBackend.js"

const routeByStorageType = (
  json: StorageBackendService,
  sqlite: StorageBackendService
): StorageBackendService => ({
  bootstrap: (projectRoot, config) =>
    config.storage.type === "json"
      ? json.bootstrap(projectRoot, config)
      : sqlite.bootstrap(projectRoot, config),
  describe: (projectRoot, config) =>
    config.storage.type === "json" ? json.describe(projectRoot, config) : sqlite.describe(projectRoot, config)
})

export const makeRoutedStorageBackend = Effect.gen(function*() {
  const json = yield* makeJsonStorageBackend
  const sqlite = yield* makeSqliteStorageBackend

  return routeByStorageType(json, sqlite)
})

export const RoutedStorageBackendLive = Layer.effect(StorageBackend, makeRoutedStorageBackend)

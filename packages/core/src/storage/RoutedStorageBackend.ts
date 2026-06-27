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
  create: (projectRoot, config, primitive) =>
    config.storage.type === "json"
      ? json.create(projectRoot, config, primitive)
      : sqlite.create(projectRoot, config, primitive),
  describe: (projectRoot, config) =>
    config.storage.type === "json" ? json.describe(projectRoot, config) : sqlite.describe(projectRoot, config),
  get: (projectRoot, config, id) =>
    config.storage.type === "json" ? json.get(projectRoot, config, id) : sqlite.get(projectRoot, config, id),
  list: (projectRoot, config, filter) =>
    config.storage.type === "json" ? json.list(projectRoot, config, filter) : sqlite.list(projectRoot, config, filter)
})

export const makeRoutedStorageBackend = Effect.gen(function*() {
  const json = yield* makeJsonStorageBackend
  const sqlite = yield* makeSqliteStorageBackend

  return routeByStorageType(json, sqlite)
})

export const RoutedStorageBackendLive = Layer.effect(StorageBackend, makeRoutedStorageBackend)

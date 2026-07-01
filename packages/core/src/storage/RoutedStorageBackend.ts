import { Effect, Layer } from "effect"

import { makeJsonStorageBackend } from "./JsonStorageBackend.js"
import { makeMarkdownStorageBackend } from "./MarkdownStorageBackend.js"
import { makeOrgStorageBackend } from "./OrgStorageBackend.js"
import { makeSqliteStorageBackend } from "./SqliteStorageBackend.js"
import { StorageBackend, type StorageBackendService } from "./StorageBackend.js"

const routeByStorageType = (
  json: StorageBackendService,
  sqlite: StorageBackendService,
  md: StorageBackendService,
  org: StorageBackendService
): StorageBackendService => ({
  bootstrap: (projectRoot, config) => {
    switch (config.storage.type) {
      case "json":
        return json.bootstrap(projectRoot, config)
      case "md":
        return md.bootstrap(projectRoot, config)
      case "org":
        return org.bootstrap(projectRoot, config)
      case "sqlite":
        return sqlite.bootstrap(projectRoot, config)
    }
  },
  create: (projectRoot, config, primitive) => {
    switch (config.storage.type) {
      case "json":
        return json.create(projectRoot, config, primitive)
      case "md":
        return md.create(projectRoot, config, primitive)
      case "org":
        return org.create(projectRoot, config, primitive)
      case "sqlite":
        return sqlite.create(projectRoot, config, primitive)
    }
  },
  describe: (projectRoot, config) => {
    switch (config.storage.type) {
      case "json":
        return json.describe(projectRoot, config)
      case "md":
        return md.describe(projectRoot, config)
      case "org":
        return org.describe(projectRoot, config)
      case "sqlite":
        return sqlite.describe(projectRoot, config)
    }
  },
  get: (projectRoot, config, id) => {
    switch (config.storage.type) {
      case "json":
        return json.get(projectRoot, config, id)
      case "md":
        return md.get(projectRoot, config, id)
      case "org":
        return org.get(projectRoot, config, id)
      case "sqlite":
        return sqlite.get(projectRoot, config, id)
    }
  },
  list: (projectRoot, config, filter) => {
    switch (config.storage.type) {
      case "json":
        return json.list(projectRoot, config, filter)
      case "md":
        return md.list(projectRoot, config, filter)
      case "org":
        return org.list(projectRoot, config, filter)
      case "sqlite":
        return sqlite.list(projectRoot, config, filter)
    }
  }
})

export const makeRoutedStorageBackend = Effect.gen(function*() {
  const json = yield* makeJsonStorageBackend
  const sqlite = yield* makeSqliteStorageBackend
  const md = yield* makeMarkdownStorageBackend
  const org = yield* makeOrgStorageBackend

  return routeByStorageType(json, sqlite, md, org)
})

export const RoutedStorageBackendLive = Layer.effect(StorageBackend, makeRoutedStorageBackend)

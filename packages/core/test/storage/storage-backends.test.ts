import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

import type { ProjectConfig } from "../../src/project/ProjectConfig.js"

import { StorageBootstrapError } from "../../src/project/errors.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../src/storage/PrimitiveTypes.js"
import { StorageBackend } from "../../src/storage/StorageBackend.js"
import { WIKI_TYPE_DIRECTORY_ENTRIES } from "../../src/storage/wiki-file-layout.js"
import { makeTempProjectDir, removeTempDir } from "../fixtures/project/helpers.js"
import {
  jsonStorageTestLayer,
  mdStorageTestLayer,
  orgStorageTestLayer,
  sqliteStorageTestLayer
} from "../fixtures/project/layers.js"

const sampleJsonConfig = (): ProjectConfig => ({
  createdAt: "2026-06-26T12:00:00.000Z",
  name: "demo-json",
  primitiveTypes: [...CANONICAL_PRIMITIVE_TYPES],
  projectId: "8f3c2e1a-4b5d-4c6e-9f0a-1b2c3d4e5f6a",
  schemaVersion: 1,
  specableVersion: 1,
  storage: { location: ".", type: "json" }
})

const sampleSqliteConfig = (): ProjectConfig => ({
  ...sampleJsonConfig(),
  name: "demo-sqlite",
  storage: { location: "graph.sqlite", type: "sqlite" }
})

const sampleMdConfig = (): ProjectConfig => ({
  ...sampleJsonConfig(),
  name: "demo-md",
  storage: { location: ".", type: "md" }
})

const sampleOrgConfig = (): ProjectConfig => ({
  ...sampleJsonConfig(),
  name: "demo-org",
  storage: { location: ".", type: "org" }
})

describe("Storage backends", () => {
  it.effect("JSON backend bootstraps and describes an empty graph", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-json-"))
      const config = sampleJsonConfig()
      const storage = yield* StorageBackend

      yield* storage.bootstrap(projectRoot, config)
      const summary = yield* storage.describe(projectRoot, config)

      expect(summary.empty).toBe(true)
      expect(summary.totalPrimitives).toBe(0)
      expect(summary.countsByType.Actor).toBe(0)

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(jsonStorageTestLayer)))

  it.effect("SQLite backend bootstraps and describes an empty graph", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-sqlite-"))
      const config = sampleSqliteConfig()
      const storage = yield* StorageBackend

      yield* storage.bootstrap(projectRoot, config)
      const summary = yield* storage.describe(projectRoot, config)

      expect(summary.empty).toBe(true)
      expect(summary.totalPrimitives).toBe(0)
      expect(path.basename(config.storage.location)).toBe("graph.sqlite")

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(sqliteStorageTestLayer)))

  it.effect("Markdown bootstrap creates directories for all primitive types", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-md-"))
      const config = sampleMdConfig()
      const storage = yield* StorageBackend

      yield* storage.bootstrap(projectRoot, config)

      const expectedCount = CANONICAL_PRIMITIVE_TYPES.length

      expect(WIKI_TYPE_DIRECTORY_ENTRIES.length).toBe(expectedCount)

      for (const entry of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const dirPath = path.join(projectRoot, entry.directoryName)
        const stat = yield* Effect.promise(() => fs.stat(dirPath))
        expect(stat.isDirectory()).toBe(true)
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(mdStorageTestLayer)))

  it.effect("Org bootstrap creates directories for all primitive types", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-org-"))
      const config = sampleOrgConfig()
      const storage = yield* StorageBackend

      yield* storage.bootstrap(projectRoot, config)

      const expectedCount = CANONICAL_PRIMITIVE_TYPES.length

      expect(WIKI_TYPE_DIRECTORY_ENTRIES.length).toBe(expectedCount)

      for (const entry of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const dirPath = path.join(projectRoot, entry.directoryName)
        const stat = yield* Effect.promise(() => fs.stat(dirPath))
        expect(stat.isDirectory()).toBe(true)
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(orgStorageTestLayer)))

  it.effect("Markdown bootstrap rejects mismatched storage type (org config)", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-md-mismatch-"))
      const config = sampleOrgConfig()
      const storage = yield* StorageBackend

      const exit = yield* Effect.exit(storage.bootstrap(projectRoot, config))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(StorageBootstrapError)
        }
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(mdStorageTestLayer)))
})

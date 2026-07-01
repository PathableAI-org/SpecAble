import * as Reactivity from "@effect/experimental/Reactivity"
import { make as makeSqliteClient } from "@effect/sql-sqlite-node/SqliteClient"
import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

import {
  DuplicatePrimitiveIdError,
  PrimitiveNotFoundError,
  PrimitiveValidationError
} from "../../src/primitive/errors.js"
import { IncompleteProjectError } from "../../src/project/errors.js"
import { StorageBackend } from "../../src/storage/StorageBackend.js"
import {
  cleanupProjectRoot,
  initJsonProjectRoot,
  initMdProjectRoot,
  initOrgProjectRoot,
  initSqliteProjectRoot,
  makeSamplePrimitive
} from "../fixtures/primitive/helpers.js"
import {
  jsonStorageTestLayer,
  mdStorageTestLayer,
  orgStorageTestLayer,
  sqliteStorageTestLayer
} from "../fixtures/project/layers.js"

const expectFailure = <E>(exit: Exit.Exit<unknown, E>, errorType: new(...args: never[]) => E) => {
  expect(Exit.isFailure(exit)).toBe(true)

  if (Exit.isFailure(exit)) {
    const error = Cause.failureOption(exit.cause)
    expect(Option.isSome(error)).toBe(true)

    if (Option.isSome(error)) {
      expect(error.value).toBeInstanceOf(errorType)
    }
  }
}

describe("Storage backend CRUD (JSON)", () => {
  it.effect("creates, lists, gets, and describes a non-empty graph", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-schedule-session-a1b2", "Schedule session")

      yield* storage.create(projectRoot, config, capability)

      const summaries = yield* storage.list(projectRoot, config)
      expect(summaries).toHaveLength(1)
      expect(summaries[0]).toEqual({
        id: capability.id,
        name: capability.name,
        status: capability.status,
        type: "Capability"
      })

      const loaded = yield* storage.get(projectRoot, config, capability.id)
      expect(loaded).toEqual(capability)

      const summary = yield* storage.describe(projectRoot, config)
      expect(summary.empty).toBe(false)
      expect(summary.totalPrimitives).toBe(1)
      expect(summary.countsByType.Capability).toBe(1)
      expect(summary.countsByType.CapabilityConceptLink).toBe(0)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(jsonStorageTestLayer)))

  it.effect("rejects duplicate primitive IDs", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-duplicate-test-x1y2", "Schedule session")
      const actor = makeSamplePrimitive("Actor", "cap-duplicate-test-x1y2", "Coach")

      yield* storage.create(projectRoot, config, capability)
      const exit = yield* Effect.exit(storage.create(projectRoot, config, actor))

      expectFailure(exit, DuplicatePrimitiveIdError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(jsonStorageTestLayer)))

  it.effect("returns PrimitiveNotFoundError for missing IDs", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const storage = yield* StorageBackend
      const exit = yield* Effect.exit(storage.get(projectRoot, config, "cap-missing-id-z9z9"))

      expectFailure(exit, PrimitiveNotFoundError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(jsonStorageTestLayer)))

  it.effect("returns PrimitiveValidationError for invalid stored payloads", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initJsonProjectRoot())
      const storage = yield* StorageBackend

      yield* Effect.promise(() =>
        fs.writeFile(
          path.join(projectRoot, "actors.json"),
          `${JSON.stringify({ primitives: [{ id: "actor-bad", status: "Draft", type: "Actor" }] }, null, 2)}\n`,
          "utf8"
        )
      )

      const exit = yield* Effect.exit(storage.list(projectRoot, config, { type: "Actor" }))

      expectFailure(exit, PrimitiveValidationError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(jsonStorageTestLayer)))
})

describe("Storage backend CRUD (SQLite)", () => {
  it.effect("creates, lists, gets, and describes a non-empty graph", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initSqliteProjectRoot())
      const storage = yield* StorageBackend
      const actor = makeSamplePrimitive("Actor", "actor-coach-a1b2", "Coach", {
        fields: { description: "Primary scheduling coach" }
      })

      yield* storage.create(projectRoot, config, actor)

      const summaries = yield* storage.list(projectRoot, config)
      expect(summaries).toHaveLength(1)
      expect(summaries[0]?.type).toBe("Actor")

      const loaded = yield* storage.get(projectRoot, config, actor.id)
      expect(loaded).toEqual(actor)

      const summary = yield* storage.describe(projectRoot, config)
      expect(summary.empty).toBe(false)
      expect(summary.totalPrimitives).toBe(1)
      expect(summary.countsByType.Actor).toBe(1)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(sqliteStorageTestLayer)))

  it.effect("rejects duplicate primitive IDs", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initSqliteProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-sqlite-dup-q7w8", "Schedule session")
      const workflow = makeSamplePrimitive("Workflow", "cap-sqlite-dup-q7w8", "Booking flow")

      yield* storage.create(projectRoot, config, capability)
      const exit = yield* Effect.exit(storage.create(projectRoot, config, workflow))

      expectFailure(exit, DuplicatePrimitiveIdError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(sqliteStorageTestLayer)))

  it.effect("returns PrimitiveNotFoundError for missing IDs", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initSqliteProjectRoot())
      const storage = yield* StorageBackend
      const exit = yield* Effect.exit(storage.get(projectRoot, config, "actor-missing-id-z9z9"))

      expectFailure(exit, PrimitiveNotFoundError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(sqliteStorageTestLayer)))

  it.effect("returns IncompleteProjectError for unknown stored primitive types", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initSqliteProjectRoot())
      const storage = yield* StorageBackend
      const dbPath = path.join(projectRoot, config.storage.location)

      yield* Effect.scoped(
        Effect.gen(function*() {
          const sql = yield* makeSqliteClient({ filename: dbPath })

          yield* sql`
            INSERT INTO primitives (id, type, payload)
            VALUES (
              ${"bad-type-row"},
              ${"NotARealType"},
              ${JSON.stringify({ id: "bad-type-row", name: "Broken", status: "Draft", type: "NotARealType" })}
            )
          `
        })
      ).pipe(Effect.provide(Reactivity.layer))

      const exit = yield* Effect.exit(storage.list(projectRoot, config))

      expectFailure(exit, IncompleteProjectError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(sqliteStorageTestLayer)))
})

describe("Storage backend CRUD (Markdown)", () => {
  it.effect("creates, lists, gets, and describes a non-empty graph (T036, T039, T042, T045)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initMdProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-schedule-session-a1b2", "Schedule session", {
        fields: { description: "Schedule coaching sessions for assigned clients" }
      })

      yield* storage.create(projectRoot, config, capability)

      const summaries = yield* storage.list(projectRoot, config)
      expect(summaries).toHaveLength(1)
      expect(summaries[0]).toEqual({
        id: capability.id,
        name: capability.name,
        status: capability.status,
        type: "Capability"
      })

      const loaded = yield* storage.get(projectRoot, config, capability.id)
      expect(loaded).toEqual(capability)

      const summary = yield* storage.describe(projectRoot, config)
      expect(summary.empty).toBe(false)
      expect(summary.totalPrimitives).toBe(1)
      expect(summary.countsByType.Capability).toBe(1)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(mdStorageTestLayer)))

  it.effect("rejects duplicate primitive IDs (T038)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initMdProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-md-dup-x1y2", "Schedule session")
      const actor = makeSamplePrimitive("Actor", "cap-md-dup-x1y2", "Coach")

      yield* storage.create(projectRoot, config, capability)
      const exit = yield* Effect.exit(storage.create(projectRoot, config, actor))

      expectFailure(exit, DuplicatePrimitiveIdError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(mdStorageTestLayer)))

  it.effect("returns PrimitiveNotFoundError for missing IDs (T041)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initMdProjectRoot())
      const storage = yield* StorageBackend
      const exit = yield* Effect.exit(storage.get(projectRoot, config, "cap-missing-id-z9z9"))

      expectFailure(exit, PrimitiveNotFoundError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(mdStorageTestLayer)))

  it.effect("list with type filter returns only matching type (T044)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initMdProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-filter-a1b2", "Capability A", {
        fields: { description: "Test capability" }
      })
      const actor = makeSamplePrimitive("Actor", "actor-filter-c3d4", "Actor A", {
        fields: { description: "Test actor" }
      })

      yield* storage.create(projectRoot, config, capability)
      yield* storage.create(projectRoot, config, actor)

      const filtered = yield* storage.list(projectRoot, config, { type: "Capability" })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.type).toBe("Capability")

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(mdStorageTestLayer)))

  it.effect("preserves multi-line body prose verbatim on round-trip (T046)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initMdProjectRoot())
      const storage = yield* StorageBackend
      const multiLineBody = `Line one of the description.
Line two of the description.
Line three with trailing space.  `
      const capability = makeSamplePrimitive("Capability", "cap-roundtrip-a1b2", "Round-trip test", {
        fields: { description: multiLineBody }
      })

      yield* storage.create(projectRoot, config, capability)

      const loaded = yield* storage.get(projectRoot, config, capability.id)
      expect(loaded.description).toBe(multiLineBody)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(mdStorageTestLayer)))

  it.effect("handles YAML frontmatter with special characters (T047)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initMdProjectRoot())
      const storage = yield* StorageBackend
      const description = "Special: chars, #hashes, and \"quotes\" in description"
      const capability = makeSamplePrimitive("Capability", "cap-special-char-x9y8", "Special Chars", {
        fields: { description }
      })

      yield* storage.create(projectRoot, config, capability)

      const loaded = yield* storage.get(projectRoot, config, capability.id)
      expect(loaded.description).toBe(description)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(mdStorageTestLayer)))
})

describe("Storage backend CRUD (Org)", () => {
  it.effect("creates, lists, gets, and describes a non-empty graph (T037, T040, T043, T045)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initOrgProjectRoot())
      const storage = yield* StorageBackend
      const actor = makeSamplePrimitive("Actor", "actor-coach-org-a1b2", "Coach", {
        fields: { description: "Primary scheduling coach" }
      })

      yield* storage.create(projectRoot, config, actor)

      const summaries = yield* storage.list(projectRoot, config)
      expect(summaries).toHaveLength(1)
      expect(summaries[0]?.type).toBe("Actor")

      const loaded = yield* storage.get(projectRoot, config, actor.id)
      expect(loaded).toEqual(actor)

      const summary = yield* storage.describe(projectRoot, config)
      expect(summary.empty).toBe(false)
      expect(summary.totalPrimitives).toBe(1)
      expect(summary.countsByType.Actor).toBe(1)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(orgStorageTestLayer)))

  it.effect("rejects duplicate primitive IDs (T038)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initOrgProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-org-dup-q7w8", "Schedule session")
      const workflow = makeSamplePrimitive("Workflow", "cap-org-dup-q7w8", "Booking flow")

      yield* storage.create(projectRoot, config, capability)
      const exit = yield* Effect.exit(storage.create(projectRoot, config, workflow))

      expectFailure(exit, DuplicatePrimitiveIdError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(orgStorageTestLayer)))

  it.effect("returns PrimitiveNotFoundError for missing IDs (T041)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initOrgProjectRoot())
      const storage = yield* StorageBackend
      const exit = yield* Effect.exit(storage.get(projectRoot, config, "actor-missing-id-z9z9"))

      expectFailure(exit, PrimitiveNotFoundError)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(orgStorageTestLayer)))

  it.effect("list with type filter returns only matching type (T044)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initOrgProjectRoot())
      const storage = yield* StorageBackend
      const capability = makeSamplePrimitive("Capability", "cap-org-filt-a1b2", "Capability A", {
        fields: { description: "Test capability" }
      })
      const actor = makeSamplePrimitive("Actor", "actor-org-filt-c3d4", "Actor A", {
        fields: { description: "Test actor" }
      })

      yield* storage.create(projectRoot, config, capability)
      yield* storage.create(projectRoot, config, actor)

      const filtered = yield* storage.list(projectRoot, config, { type: "Actor" })
      expect(filtered).toHaveLength(1)
      expect(filtered[0]?.type).toBe("Actor")

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(orgStorageTestLayer)))

  it.effect("preserves multi-line body prose verbatim on round-trip (T046)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initOrgProjectRoot())
      const storage = yield* StorageBackend
      const multiLineBody = `Line one of the description.
Line two of the description.
Line three with trailing space.  `
      const actor = makeSamplePrimitive("Actor", "actor-org-rtrip-a1b2", "Round-trip test", {
        fields: { description: multiLineBody }
      })

      yield* storage.create(projectRoot, config, actor)

      const loaded = yield* storage.get(projectRoot, config, actor.id)
      expect(loaded.description).toBe(multiLineBody)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(orgStorageTestLayer)))

  it.effect("handles Org property drawer with colons in values (T048)", () =>
    Effect.gen(function*() {
      const { config, parentDir, projectRoot } = yield* Effect.promise(() => initOrgProjectRoot())
      const storage = yield* StorageBackend
      const description = "Some description with: colons and more: text"
      const actor = makeSamplePrimitive("Actor", "actor-colon-val-a1b2", "Colon Value", {
        fields: { description }
      })

      yield* storage.create(projectRoot, config, actor)

      const loaded = yield* storage.get(projectRoot, config, actor.id)
      expect(loaded.description).toBe(description)

      yield* Effect.promise(() => cleanupProjectRoot(parentDir))
    }).pipe(Effect.provide(orgStorageTestLayer)))
})

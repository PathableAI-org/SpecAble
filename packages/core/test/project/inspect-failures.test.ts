import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { IncompleteProjectError, ProjectConfigDecodeError, ProjectNotFoundError } from "../../src/project/errors.js"
import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { makeTempProjectDir, removeTempDir, writeSpecableJson } from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer } from "../fixtures/project/layers.js"

const legacyV0FixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../cli/examples/generic/valid"
)

describe("ProjectRootService.describe failures", () => {
  it.effect("fails when the project root directory does not exist", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-inspect-missing-"))
      const missingPath = path.join(projectRoot, "does-not-exist")
      const service = yield* ProjectRootService

      yield* Effect.promise(() => removeTempDir(projectRoot))

      const exit = yield* Effect.exit(service.describe(missingPath))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectNotFoundError)
        }
      }
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when specable.json is missing", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-inspect-no-manifest-"))
      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(service.describe(projectRoot))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectNotFoundError)
        }
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when specable.json cannot be decoded", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-inspect-bad-manifest-"))
      yield* Effect.promise(() => fs.writeFile(path.join(projectRoot, "specable.json"), "{ not valid }\n", "utf8"))

      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(service.describe(projectRoot))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectConfigDecodeError)
        }
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when storage artifacts are incomplete", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-inspect-incomplete-"))
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "json" })
      yield* Effect.promise(() => fs.rm(path.join(projectRoot, "actors.json")))

      const exit = yield* Effect.exit(service.describe(projectRoot))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(IncompleteProjectError)
        }
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails for legacy v0 fixture directories without specable.json", () =>
    Effect.gen(function*() {
      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(service.describe(legacyV0FixtureDir))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectNotFoundError)
        }
      }
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when specable.json schema is invalid", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-inspect-invalid-schema-"))
      yield* Effect.promise(() =>
        writeSpecableJson(projectRoot, {
          createdAt: "not-a-valid-project",
          name: "",
          primitiveTypes: [],
          projectId: "not-a-uuid",
          schemaVersion: 1,
          specableVersion: 1,
          storage: { location: ".", type: "json" }
        } as never)
      )

      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(service.describe(projectRoot))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectConfigDecodeError)
        }
      }

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))
})

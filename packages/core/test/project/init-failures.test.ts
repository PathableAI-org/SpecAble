import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Option } from "effect"
import * as fs from "node:fs/promises"
import * as path from "node:path"

import {
  ProjectAlreadyInitializedError,
  ProjectNotFoundError,
  ProjectPathNotEmptyError
} from "../../src/project/errors.js"
import { ProjectRootService } from "../../src/project/ProjectRootService.js"
import { makeTempProjectDir, readSpecableJson, removeTempDir } from "../fixtures/project/helpers.js"
import { projectRootJsonTestLayer } from "../fixtures/project/layers.js"

describe("ProjectRootService.initialize failures", () => {
  it.effect("fails when specable.json already exists", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-init-reinit-"))
      const service = yield* ProjectRootService

      yield* service.initialize(projectRoot, { storage: "json" })

      const beforeConfig = yield* Effect.promise(() => readSpecableJson(projectRoot))
      const exit = yield* Effect.exit(service.initialize(projectRoot, { storage: "json" }))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectAlreadyInitializedError)
        }
      }

      const afterConfig = yield* Effect.promise(() => readSpecableJson(projectRoot))
      expect(afterConfig).toEqual(beforeConfig)

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when target directory is non-empty without specable.json", () =>
    Effect.gen(function*() {
      const projectRoot = yield* Effect.promise(() => makeTempProjectDir("specable-init-nonempty-"))
      yield* Effect.promise(() => fs.writeFile(path.join(projectRoot, "existing.txt"), "occupied\n", "utf8"))

      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(service.initialize(projectRoot, { storage: "json" }))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectPathNotEmptyError)
        }
      }

      const manifestExists = yield* Effect.promise(() =>
        fs.access(path.join(projectRoot, "specable.json")).then(() => true).catch(() => false)
      )
      expect(manifestExists).toBe(false)

      yield* Effect.promise(() => removeTempDir(projectRoot))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when the target path cannot be written", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-init-perms-"))
      const projectRoot = path.join(parentDir, "readonly-child")

      yield* Effect.promise(async () => {
        await fs.mkdir(projectRoot)
        await fs.chmod(projectRoot, 0o444)
      })

      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(
        service.initialize(projectRoot, {
          name: "blocked",
          storage: "json"
        })
      )

      yield* Effect.promise(async () => {
        await fs.chmod(projectRoot, 0o755)
        await removeTempDir(parentDir)
      })

      expect(Exit.isFailure(exit)).toBe(true)
    }).pipe(Effect.provide(projectRootJsonTestLayer)))

  it.effect("fails when target path exists but is not a directory", () =>
    Effect.gen(function*() {
      const parentDir = yield* Effect.promise(() => makeTempProjectDir("specable-init-file-path-"))
      const filePath = path.join(parentDir, "existing-file")
      yield* Effect.promise(() => fs.writeFile(filePath, "not a directory\n", "utf8"))

      const service = yield* ProjectRootService
      const exit = yield* Effect.exit(service.initialize(filePath, { storage: "json" }))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)

        if (Option.isSome(error)) {
          expect(error.value).toBeInstanceOf(ProjectNotFoundError)
        }
      }

      yield* Effect.promise(() => removeTempDir(parentDir))
    }).pipe(Effect.provide(projectRootJsonTestLayer)))
})

import type { PlatformError } from "@effect/platform/Error"

import * as FileSystem from "@effect/platform/FileSystem"
import { ArrayFormatter } from "@effect/schema"
import { Effect as E } from "effect"
import { randomUUID } from "node:crypto"
import * as path from "node:path"

import type { ProjectInitError, ProjectInspectError } from "./errors.js"
import type { ProjectDescriptor } from "./ProjectDescriptor.js"

import { CANONICAL_PRIMITIVE_TYPES } from "../storage/PrimitiveTypes.js"
import { StorageBackend } from "../storage/StorageBackend.js"
import {
  ProjectAlreadyInitializedError,
  ProjectConfigDecodeError,
  ProjectNotFoundError,
  ProjectPathNotEmptyError
} from "./errors.js"
import { decodeProjectConfig, encodeProjectConfig, type ProjectConfig } from "./ProjectConfig.js"

const SPECABLE_JSON = "specable.json"

const SQLITE_DATABASE_FILE = "graph.sqlite"

const storageBindingFor = (storage: "json" | "sqlite"): ProjectConfig["storage"] =>
  storage === "json" ? { location: ".", type: "json" } : { location: SQLITE_DATABASE_FILE, type: "sqlite" }

const resolveProjectName = (projectRoot: string, name?: string): string => {
  const trimmed = name?.trim()

  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed
  }

  return path.basename(projectRoot)
}

const buildProjectConfig = (
  projectRoot: string,
  options: ProjectRootInitializeOptions
): ProjectConfig => ({
  createdAt: new Date().toISOString(),
  name: resolveProjectName(projectRoot, options.name),
  primitiveTypes: [...CANONICAL_PRIMITIVE_TYPES],
  projectId: randomUUID(),
  schemaVersion: 1,
  specableVersion: 1,
  storage: storageBindingFor(options.storage)
})

/**
 * Project root init/inspect orchestration. Compose `ProjectRootService.Default`
 * with a `StorageBackend` Live Layer and its upstream `FileSystem` parent at the
 * application entrypoint (for example `packages/cli/src/services/Layers.ts`).
 * Public methods use `R = never`; `StorageBackend` is captured at Layer build.
 */
export type ProjectRootDescribe = (
  projectPath: string
) => E.Effect<ProjectDescriptor, PlatformError | ProjectInspectError>

export type ProjectRootInitialize = (
  projectPath: string,
  options: ProjectRootInitializeOptions
) => E.Effect<ProjectConfig, PlatformError | ProjectInitError>

export interface ProjectRootInitializeOptions {
  readonly name?: string | undefined
  readonly storage: "json" | "sqlite"
}

export interface ProjectRootServiceApi {
  readonly describe: ProjectRootDescribe
  readonly initialize: ProjectRootInitialize
}

export type ProjectRootServiceError = ProjectInitError | ProjectInspectError

export class ProjectRootService extends E.Service<ProjectRootService>()("@specable/core/ProjectRootService", {
  effect: E.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    const storage = yield* StorageBackend

    const resolveProjectRoot = (projectPath: string): string => path.resolve(projectPath)

    const assertNotInitialized = (projectRoot: string) =>
      E.gen(function*() {
        const manifestPath = path.join(projectRoot, SPECABLE_JSON)
        const exists = yield* fs.exists(manifestPath)

        if (exists) {
          return yield* E.fail(new ProjectAlreadyInitializedError({ path: projectRoot }))
        }
      })

    const validateInitPathType = (projectRoot: string) =>
      E.gen(function*() {
        const exists = yield* fs.exists(projectRoot)

        if (!exists) {
          return
        }

        const stat = yield* fs.stat(projectRoot)

        if (stat.type !== "Directory") {
          return yield* E.fail(new ProjectNotFoundError({ path: projectRoot }))
        }
      })

    const ensureProjectDirectory = (projectRoot: string) =>
      E.gen(function*() {
        const exists = yield* fs.exists(projectRoot)

        if (!exists) {
          yield* fs.makeDirectory(projectRoot, { recursive: true })

          return
        }

        const entries = yield* fs.readDirectory(projectRoot)

        if (entries.length > 0) {
          return yield* E.fail(new ProjectPathNotEmptyError({ path: projectRoot }))
        }
      })

    const writeManifest = (projectRoot: string, config: ProjectConfig) =>
      E.gen(function*() {
        const encoded = yield* encodeProjectConfig(config).pipe(E.orDie)
        const manifestPath = path.join(projectRoot, SPECABLE_JSON)

        yield* fs.writeFileString(manifestPath, `${JSON.stringify(encoded, null, 2)}\n`)
      })

    const readManifest = (projectRoot: string) =>
      E.gen(function*() {
        const manifestPath = path.join(projectRoot, SPECABLE_JSON)
        const exists = yield* fs.exists(manifestPath)

        if (!exists) {
          return yield* E.fail(new ProjectNotFoundError({ path: projectRoot }))
        }

        const content = yield* fs.readFileString(manifestPath)
        const parsed = yield* E.try({
          catch: () =>
            new ProjectConfigDecodeError({
              message: "Invalid JSON in specable.json"
            }),
          try: () => JSON.parse(content) as unknown
        })

        return yield* decodeProjectConfig(parsed).pipe(
          E.mapError((error) => {
            const formatted = ArrayFormatter.formatErrorSync(error)[0]
            const message = formatted?.message ?? "Invalid specable.json"
            const fieldPath = formatted?.path?.join(".")

            return fieldPath === undefined
              ? new ProjectConfigDecodeError({ message })
              : new ProjectConfigDecodeError({ message, path: fieldPath })
          })
        )
      })

    const assertInspectableProjectRoot = (projectRoot: string) =>
      E.gen(function*() {
        const exists = yield* fs.exists(projectRoot)

        if (!exists) {
          return yield* E.fail(new ProjectNotFoundError({ path: projectRoot }))
        }

        const stat = yield* fs.stat(projectRoot)

        if (stat.type !== "Directory") {
          return yield* E.fail(new ProjectNotFoundError({ path: projectRoot }))
        }
      })

    const describe: ProjectRootDescribe = (projectPath) =>
      E.gen(function*() {
        const projectRoot = resolveProjectRoot(projectPath)

        yield* assertInspectableProjectRoot(projectRoot)

        const config = yield* readManifest(projectRoot)
        const graph = yield* storage.describe(projectRoot, config)

        return {
          createdAt: config.createdAt,
          graph,
          name: config.name,
          primitiveTypes: config.primitiveTypes,
          projectId: config.projectId,
          rootPath: projectRoot,
          schemaVersion: config.schemaVersion,
          storage: config.storage
        } satisfies ProjectDescriptor
      })

    const initialize: ProjectRootInitialize = (projectPath, options) =>
      E.gen(function*() {
        const projectRoot = resolveProjectRoot(projectPath)

        yield* validateInitPathType(projectRoot)
        yield* assertNotInitialized(projectRoot)
        yield* ensureProjectDirectory(projectRoot)

        const config = buildProjectConfig(projectRoot, options)

        yield* storage.bootstrap(projectRoot, config)
        yield* writeManifest(projectRoot, config)

        return config
      })

    return {
      describe,
      initialize
    } satisfies ProjectRootServiceApi
  })
}) {}

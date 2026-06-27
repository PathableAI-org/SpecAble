import type { Effect } from "effect"

import { Effect as E } from "effect"

import type { ProjectInitError, ProjectInspectError } from "./errors.js"
import type { ProjectDescriptor } from "./ProjectDescriptor.js"

import { StorageBackend } from "../storage/StorageBackend.js"

/**
 * Project root init/inspect orchestration. Compose `ProjectRootService.Default`
 * with a `StorageBackend` Live Layer and its upstream `FileSystem` parent at the
 * application entrypoint (for example `packages/cli/src/services/Layers.ts`).
 * Public methods use `R = never`; `StorageBackend` is captured at Layer build.
 */
export type ProjectRootDescribe = (
  projectPath: string
) => Effect.Effect<ProjectDescriptor, ProjectInspectError>

export type ProjectRootInitialize = (
  projectPath: string,
  options: ProjectRootInitializeOptions
) => Effect.Effect<void, ProjectInitError>

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
    yield* StorageBackend

    return {
      describe: (projectPath) =>
        E.dieMessage(`ProjectRootService.describe not implemented until Phase 3 (${projectPath})`),
      initialize: (projectPath, options) =>
        E.dieMessage(
          `ProjectRootService.initialize not implemented until Phase 3 (${projectPath}, ${options.storage})`
        )
    } satisfies ProjectRootServiceApi
  })
}) {}

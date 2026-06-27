import type { PlatformError } from "@effect/platform/Error"
import type * as FileSystem from "@effect/platform/FileSystem"
import type { Effect } from "effect"

import { Context } from "effect"

import type { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import type { ProjectConfig } from "../project/ProjectConfig.js"
import type { GraphStoreSummary } from "../project/ProjectDescriptor.js"

export type StorageBackendBootstrap = (
  projectRoot: string,
  config: ProjectConfig
) => Effect.Effect<void, PlatformError | StorageBootstrapError, FileSystem.FileSystem>

export type StorageBackendDescribe = (
  projectRoot: string,
  config: ProjectConfig
) => Effect.Effect<GraphStoreSummary, IncompleteProjectError | PlatformError, FileSystem.FileSystem>

export type StorageBackendError = IncompleteProjectError | PlatformError | StorageBootstrapError

export interface StorageBackendService {
  readonly bootstrap: StorageBackendBootstrap
  readonly describe: StorageBackendDescribe
}

export class StorageBackend extends Context.Tag("@specable/core/StorageBackend")<
  StorageBackend,
  StorageBackendService
>() {}

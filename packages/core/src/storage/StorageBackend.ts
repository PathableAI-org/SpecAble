import type { PlatformError } from "@effect/platform/Error"
import type { Primitive } from "@specable/domain"
import type { Effect } from "effect"

import { Context } from "effect"

import type { StorageCreateError, StorageReadError } from "../primitive/errors.js"
import type { AlphaPrimitiveType, PrimitiveSummary } from "../primitive/PrimitiveSummary.js"
import type { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import type { ProjectConfig } from "../project/ProjectConfig.js"
import type { GraphStoreSummary } from "../project/ProjectDescriptor.js"

export interface PrimitiveListFilter {
  readonly type?: AlphaPrimitiveType | undefined
}

export type StorageBackendBootstrap = (
  projectRoot: string,
  config: ProjectConfig
) => Effect.Effect<void, PlatformError | StorageBootstrapError, never>

export type StorageBackendCreate = (
  projectRoot: string,
  config: ProjectConfig,
  primitive: Primitive
) => Effect.Effect<void, StorageCreateError, never>

export type StorageBackendDescribe = (
  projectRoot: string,
  config: ProjectConfig
) => Effect.Effect<GraphStoreSummary, IncompleteProjectError | PlatformError, never>

export type StorageBackendError = IncompleteProjectError | PlatformError | StorageBootstrapError

export type StorageBackendGet = (
  projectRoot: string,
  config: ProjectConfig,
  id: string
) => Effect.Effect<Primitive, StorageReadError, never>

export type StorageBackendList = (
  projectRoot: string,
  config: ProjectConfig,
  filter?: PrimitiveListFilter
) => Effect.Effect<readonly PrimitiveSummary[], StorageReadError, never>

export interface StorageBackendService {
  readonly bootstrap: StorageBackendBootstrap
  readonly create: StorageBackendCreate
  readonly describe: StorageBackendDescribe
  readonly get: StorageBackendGet
  readonly list: StorageBackendList
}

export class StorageBackend extends Context.Tag("@specable/core/StorageBackend")<
  StorageBackend,
  StorageBackendService
>() {}

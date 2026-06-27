import type { PlatformError } from "@effect/platform/Error"
import type { Primitive } from "@specable/domain"

import * as FileSystem from "@effect/platform/FileSystem"
import { Effect as E } from "effect"

import type { CreateInput } from "./CreateInput.js"
import type { PrimitiveServiceError } from "./errors.js"
import type { AlphaPrimitiveType, PrimitiveSummary } from "./PrimitiveSummary.js"

import { StorageBackend } from "../storage/StorageBackend.js"

export type PrimitiveCreate = (
  input: CreateInput
) => E.Effect<Primitive, PrimitiveServiceError, never>

export type PrimitiveGet = (
  rootPath: string,
  id: string
) => E.Effect<Primitive, PrimitiveServiceError, never>

export type PrimitiveList = (
  rootPath: string,
  filter?: { readonly type?: AlphaPrimitiveType | undefined }
) => E.Effect<readonly PrimitiveSummary[], PrimitiveServiceError, never>

export interface PrimitiveServiceApi {
  readonly create: PrimitiveCreate
  readonly get: PrimitiveGet
  readonly list: PrimitiveList
}

/**
 * Primitive create/list/get orchestration. Compose `PrimitiveService.Default`
 * with a `StorageBackend` Live Layer and its upstream `FileSystem` parent at the
 * application entrypoint (for example `packages/cli/src/services/Layers.ts`).
 * Public methods use `R = never`; `StorageBackend` is captured at Layer build.
 *
 * Phase 3–5 implement full orchestration; Phase 2 exports the service skeleton.
 */
export class PrimitiveService extends E.Service<PrimitiveService>()("@specable/core/PrimitiveService", {
  effect: E.gen(function*() {
    yield* FileSystem.FileSystem
    yield* StorageBackend

    const notImplemented = (operation: string): E.Effect<never, never, never> =>
      E.dieSync(() => new Error(`${operation} is implemented in Phase 3–5`))

    const create: PrimitiveCreate = (input) => {
      void input
      return notImplemented("PrimitiveService.create")
    }

    const list: PrimitiveList = (rootPath, filter) => {
      void rootPath
      void filter
      return notImplemented("PrimitiveService.list")
    }

    const get: PrimitiveGet = (rootPath, id) => {
      void rootPath
      void id
      return notImplemented("PrimitiveService.get")
    }

    return {
      create,
      get,
      list
    } satisfies PrimitiveServiceApi
  })
}) {}

export type { PlatformError }

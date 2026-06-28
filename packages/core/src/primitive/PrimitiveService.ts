import type { PlatformError } from "@effect/platform/Error"
import type { Primitive } from "@specable/domain"

import * as FileSystem from "@effect/platform/FileSystem"
import { ArrayFormatter } from "@effect/schema"
import { Effect as E } from "effect"
import * as path from "node:path"

import type { CreateInput } from "./CreateInput.js"
import type { AlphaPrimitiveType, PrimitiveSummary } from "./PrimitiveSummary.js"

import { ProjectConfigDecodeError, ProjectNotFoundError } from "../project/errors.js"
import { decodeProjectConfig } from "../project/ProjectConfig.js"
import { decodeAlphaPrimitiveUnknown, isAlphaCreatableType } from "../storage/PrimitiveSchemas.js"
import { StorageBackend } from "../storage/StorageBackend.js"
import { assignPrimitiveId } from "./assignPrimitiveId.js"
import { type PrimitiveServiceError, PrimitiveServiceNotImplementedError, UnknownPrimitiveTypeError } from "./errors.js"

const SPECABLE_JSON = "specable.json"

const comparePrimitiveSummaries = (
  left: PrimitiveSummary,
  right: PrimitiveSummary
): number => {
  const typeCompare = left.type.localeCompare(right.type)

  if (typeCompare !== 0) {
    return typeCompare
  }

  const nameCompare = left.name.localeCompare(right.name)

  if (nameCompare !== 0) {
    return nameCompare
  }

  return left.id.localeCompare(right.id)
}

const sortPrimitiveSummaries = (
  summaries: readonly PrimitiveSummary[]
): readonly PrimitiveSummary[] => [...summaries].sort(comparePrimitiveSummaries)

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
 */
export class PrimitiveService extends E.Service<PrimitiveService>()("@specable/core/PrimitiveService", {
  effect: E.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    const storage = yield* StorageBackend

    const resolveProjectRoot = (projectPath: string): string => path.resolve(projectPath)

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

    const notImplemented = (operation: string): E.Effect<never, PrimitiveServiceNotImplementedError> =>
      E.fail(new PrimitiveServiceNotImplementedError({ operation }))

    const create: PrimitiveCreate = (input) =>
      E.gen(function*() {
        if (!isAlphaCreatableType(input.type)) {
          return yield* E.fail(new UnknownPrimitiveTypeError({ type: input.type }))
        }

        const type = input.type
        const projectRoot = resolveProjectRoot(input.rootPath)

        yield* assertInspectableProjectRoot(projectRoot)

        const config = yield* readManifest(projectRoot)
        const id = assignPrimitiveId(type, input.name)
        const status = input.status ?? "Draft"
        const merged = {
          ...input.fields,
          id,
          name: input.name,
          status,
          type
        }

        const primitive = yield* decodeAlphaPrimitiveUnknown(type, projectRoot, merged)
        yield* storage.create(projectRoot, config, primitive)

        return primitive
      })

    const list: PrimitiveList = (rootPath, filter) =>
      E.gen(function*() {
        if (filter?.type !== undefined && !isAlphaCreatableType(filter.type)) {
          return yield* E.fail(new UnknownPrimitiveTypeError({ type: filter.type }))
        }

        const projectRoot = resolveProjectRoot(rootPath)

        yield* assertInspectableProjectRoot(projectRoot)

        const config = yield* readManifest(projectRoot)
        const summaries = yield* storage.list(
          projectRoot,
          config,
          filter?.type === undefined ? undefined : { type: filter.type }
        )

        return sortPrimitiveSummaries(summaries)
      })

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

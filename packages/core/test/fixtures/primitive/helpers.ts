import type { Primitive } from "@specable/domain"

import { PrimitiveId } from "@specable/domain/PrimitiveBase.js"
import { Effect } from "effect"

import type { CreateInput } from "../../../src/primitive/CreateInput.js"
import type { AlphaPrimitiveType } from "../../../src/primitive/PrimitiveSummary.js"
import type { ProjectConfig } from "../../../src/project/ProjectConfig.js"

import { ProjectRootService } from "../../../src/project/ProjectRootService.js"
import { CANONICAL_PRIMITIVE_TYPES } from "../../../src/storage/PrimitiveTypes.js"
import { makeTempProjectDir, removeTempDir } from "../project/helpers.js"
import { projectRootJsonTestLayer, projectRootSqliteTestLayer } from "../project/layers.js"

export const sampleCreateInput = (
  rootPath: string,
  type: AlphaPrimitiveType,
  name: string,
  options?: {
    readonly fields?: Record<string, unknown> | undefined
    readonly status?: CreateInput["status"]
  }
): CreateInput => ({
  fields: options?.fields,
  name,
  rootPath,
  status: options?.status,
  type
})

export const sampleCapabilityFields = {
  description: "Schedule coaching sessions for assigned clients"
} as const

export const sampleActorFields = {
  description: "Coach responsible for session scheduling"
} as const

export const makeSamplePrimitive = (
  type: AlphaPrimitiveType,
  id: string,
  name: string,
  options?: {
    readonly fields?: Record<string, unknown>
    readonly status?: Primitive["status"]
  }
): Primitive => ({
  id: PrimitiveId.make(id),
  name,
  status: options?.status ?? "Draft",
  type,
  ...options?.fields
})

export const initJsonProjectRoot = async (name = "demo-json"): Promise<{
  readonly config: ProjectConfig
  readonly parentDir: string
  readonly projectRoot: string
}> => {
  const parentDir = await makeTempProjectDir("specable-primitive-json-")
  const projectRoot = `${parentDir}/${name}`

  const config = await Effect.runPromise(
    Effect.gen(function*() {
      const service = yield* ProjectRootService

      return yield* service.initialize(projectRoot, { name, storage: "json" })
    }).pipe(Effect.provide(projectRootJsonTestLayer))
  )

  return { config, parentDir, projectRoot }
}

export const initSqliteProjectRoot = async (name = "demo-sqlite"): Promise<{
  readonly config: ProjectConfig
  readonly parentDir: string
  readonly projectRoot: string
}> => {
  const parentDir = await makeTempProjectDir("specable-primitive-sqlite-")
  const projectRoot = `${parentDir}/${name}`

  const config = await Effect.runPromise(
    Effect.gen(function*() {
      const service = yield* ProjectRootService

      return yield* service.initialize(projectRoot, { name, storage: "sqlite" })
    }).pipe(Effect.provide(projectRootSqliteTestLayer))
  )

  return { config, parentDir, projectRoot }
}

export const cleanupProjectRoot = async (parentDir: string): Promise<void> => removeTempDir(parentDir)

export const defaultPrimitiveTypes = [...CANONICAL_PRIMITIVE_TYPES] as const

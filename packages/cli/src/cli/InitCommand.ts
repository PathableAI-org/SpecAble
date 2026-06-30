import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors, ProjectRootService } from "@specable/core"
import { Effect, Option } from "effect"
import * as path from "node:path"

import { projectRootLiveLayer } from "../services/Layers.js"

const {
  ProjectAlreadyInitializedError,
  ProjectNotFoundError,
  ProjectPathNotEmptyError,
  StorageBootstrapError,
  UnsupportedStorageTypeError
} = errors

const projectPath = Args.directory({ name: "path" })
export const initStorageOption = Options.text("storage").pipe(Options.withDefault("json"))
const storage = initStorageOption
const name = Options.text("name").pipe(Options.optional)

const SUPPORTED_STORAGE_TYPES = ["json", "sqlite", "md", "org"] as const

type SupportedStorageType = (typeof SUPPORTED_STORAGE_TYPES)[number]

const parseStorageType = (
  value: string
): Effect.Effect<SupportedStorageType, InstanceType<typeof UnsupportedStorageTypeError>> => {
  if (value === "json" || value === "sqlite" || value === "md" || value === "org") {
    return Effect.succeed(value)
  }

  return Effect.fail(new UnsupportedStorageTypeError({ storageType: value }))
}

export interface InitSuccessDetails {
  readonly name: string
  readonly projectId: string
  readonly rootPath: string
  readonly storage: SupportedStorageType
}

export const formatInitSuccessOutput = (details: InitSuccessDetails): string =>
  [
    `Initialized SpecAble project "${details.name}"`,
    `  projectId: ${details.projectId}`,
    `  storage: ${details.storage}`,
    `  root: ${details.rootPath}`
  ].join("\n")

const runInitCommand = (
  targetPath: string,
  storageType: SupportedStorageType,
  displayName: string | undefined
) =>
  Effect.gen(function*() {
    const service = yield* ProjectRootService.ProjectRootService
    const rootPath = path.resolve(targetPath)
    const config = yield* service.initialize(rootPath, {
      name: displayName,
      storage: storageType
    })

    const output = formatInitSuccessOutput({
      name: config.name,
      projectId: config.projectId,
      rootPath,
      storage: storageType
    })

    yield* Effect.sync(() => console.log(output))
  }).pipe(Effect.provide(projectRootLiveLayer(storageType)))

export const initCommand = Command.make(
  "init",
  { name, path: projectPath, storage },
  ({ name: displayName, path: targetPath, storage: storageValue }) =>
    Effect.gen(function*() {
      const storageType = yield* parseStorageType(storageValue)

      return yield* runInitCommand(targetPath, storageType, Option.getOrUndefined(displayName))
    })
).pipe(Command.withDescription("Initialize a new SpecAble project root"))

const exitWithCode = (code: 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

export const resolveInitCommandExit = (
  error: unknown
): undefined | { readonly code: 2; readonly message?: string } => {
  if (Schema.is(ProjectAlreadyInitializedError)(error)) {
    return { code: 2, message: `Project already initialized: ${error.path}` }
  }

  if (Schema.is(ProjectPathNotEmptyError)(error)) {
    return { code: 2, message: `Project path is not empty: ${error.path}` }
  }

  if (Schema.is(ProjectNotFoundError)(error)) {
    return { code: 2, message: `Project root not found: ${error.path}` }
  }

  if (Schema.is(UnsupportedStorageTypeError)(error)) {
    return {
      code: 2,
      message: `Unsupported storage type "${error.storageType}". Supported types: ${
        SUPPORTED_STORAGE_TYPES.join(", ")
      }.`
    }
  }

  if (Schema.is(StorageBootstrapError)(error)) {
    return { code: 2, message: `Storage bootstrap failed for ${error.path}: ${error.message}` }
  }

  if (isPlatformError(error)) {
    return { code: 2, message: `Project init error: ${error.message}` }
  }

  return undefined
}

export const handleInitCommandError = (error: unknown): Effect.Effect<void> => {
  const resolution = resolveInitCommandExit(error)

  if (resolution === undefined) {
    return Effect.die(error)
  }

  return exitWithCode(resolution.code, resolution.message)
}

import { Args, Command } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors, ProjectRootService } from "@specable/core"
import { Effect } from "effect"
import * as path from "node:path"

import { projectRootInspectLiveLayer } from "../services/Layers.js"
import { formatProjectShowOutput } from "./render/ProjectShowOutput.js"

const {
  IncompleteProjectError,
  ProjectConfigDecodeError,
  ProjectNotFoundError,
  UnsupportedStorageTypeError
} = errors

const projectPath = Args.directory({ name: "path" })

const runProjectShowCommand = (targetPath: string) =>
  Effect.gen(function*() {
    const service = yield* ProjectRootService.ProjectRootService
    const rootPath = path.resolve(targetPath)
    const descriptor = yield* service.describe(rootPath)
    const output = formatProjectShowOutput(descriptor)

    yield* Effect.sync(() => console.log(output))
  }).pipe(Effect.provide(projectRootInspectLiveLayer))

export const projectShowCommand = Command.make(
  "show",
  { path: projectPath },
  ({ path: targetPath }) => runProjectShowCommand(targetPath)
).pipe(Command.withDescription("Inspect an initialized SpecAble project root"))

const exitWithCode = (code: 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

export const resolveProjectShowCommandExit = (
  error: unknown
): undefined | { readonly code: 2; readonly message?: string } => {
  if (Schema.is(ProjectNotFoundError)(error)) {
    return { code: 2, message: `Not a valid SpecAble project root: ${error.path}` }
  }

  if (Schema.is(ProjectConfigDecodeError)(error)) {
    const field = error.path === undefined ? "" : ` (${error.path})`

    return { code: 2, message: `Invalid specable.json${field}: ${error.message}` }
  }

  if (Schema.is(IncompleteProjectError)(error)) {
    return { code: 2, message: `Incomplete project storage at ${error.path}: ${error.message}` }
  }

  if (Schema.is(UnsupportedStorageTypeError)(error)) {
    return {
      code: 2,
      message: `Unsupported storage type "${error.storageType}". Supported types: json, sqlite.`
    }
  }

  if (isPlatformError(error)) {
    return { code: 2, message: `Project inspect error: ${error.message}` }
  }

  return undefined
}

export const handleProjectShowCommandError = (error: unknown): Effect.Effect<void> => {
  const resolution = resolveProjectShowCommandExit(error)

  if (resolution === undefined) {
    return Effect.die(error)
  }

  return exitWithCode(resolution.code, resolution.message)
}

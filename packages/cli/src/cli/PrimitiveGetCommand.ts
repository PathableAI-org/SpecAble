import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors, primitiveErrors, PrimitiveService } from "@specable/core"
import { Effect } from "effect"
import * as path from "node:path"

import { primitiveServiceLiveLayer } from "../services/Layers.js"
import { formatPrimitiveGetSuccessOutput } from "./render/PrimitiveOutput.js"

const {
  PrimitiveNotFoundError,
  PrimitiveValidationError
} = primitiveErrors

const {
  IncompleteProjectError,
  ProjectConfigDecodeError,
  ProjectNotFoundError
} = errors

const projectPath = Args.directory({ name: "path" })
const idOption = Options.text("id")

export const runPrimitiveGetCommand = (targetPath: string, primitiveId: string) =>
  Effect.gen(function*() {
    const service = yield* PrimitiveService.PrimitiveService
    const rootPath = path.resolve(targetPath)
    const primitive = yield* service.get(rootPath, primitiveId)
    const output = formatPrimitiveGetSuccessOutput(primitive)

    yield* Effect.sync(() => console.log(output))
  }).pipe(Effect.provide(primitiveServiceLiveLayer))

export const primitiveGetCommand = Command.make(
  "get",
  { id: idOption, path: projectPath },
  ({ id: primitiveId, path: targetPath }) => runPrimitiveGetCommand(targetPath, primitiveId)
).pipe(Command.withDescription("Get a product primitive by ID from a project root"))

const exitWithCode = (code: 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

export const resolvePrimitiveGetCommandExit = (
  error: unknown
): undefined | { readonly code: 2; readonly message?: string } => {
  if (Schema.is(PrimitiveNotFoundError)(error)) {
    return {
      code: 2,
      message: `Primitive not found: ${error.id} in project root ${error.path}`
    }
  }

  if (Schema.is(PrimitiveValidationError)(error)) {
    const fieldPaths = error.fieldPaths === undefined ? "" : ` (${error.fieldPaths.join(", ")})`

    return {
      code: 2,
      message: `Primitive validation failed for ${error.type}${fieldPaths}: ${error.message}`
    }
  }

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

  if (isPlatformError(error)) {
    return { code: 2, message: `Primitive get error: ${error.message}` }
  }

  return undefined
}

export const handlePrimitiveGetCommandError = (error: unknown): Effect.Effect<void> => {
  const resolution = resolvePrimitiveGetCommandExit(error)

  if (resolution === undefined) {
    return Effect.die(error)
  }

  return exitWithCode(resolution.code, resolution.message)
}

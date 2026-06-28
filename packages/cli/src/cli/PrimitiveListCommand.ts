import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors, primitiveErrors, PrimitiveService, PrimitiveSummary } from "@specable/core"
import { Effect, Option } from "effect"
import * as path from "node:path"

import { primitiveServiceLiveLayer } from "../services/Layers.js"
import { formatPrimitiveListSuccessOutput } from "./render/PrimitiveOutput.js"

const { UnknownPrimitiveTypeError } = primitiveErrors

const {
  IncompleteProjectError,
  ProjectConfigDecodeError,
  ProjectNotFoundError
} = errors

const projectPath = Args.directory({ name: "path" })
const typeOption = Options.text("type").pipe(Options.optional)

const SUPPORTED_TYPES = [...PrimitiveSummary.ALPHA_PRIMITIVE_TYPES]

const parsePrimitiveTypeFilter = (
  value: string
): Effect.Effect<(typeof SUPPORTED_TYPES)[number], InstanceType<typeof UnknownPrimitiveTypeError>> => {
  if ((SUPPORTED_TYPES as readonly string[]).includes(value)) {
    return Effect.succeed(value as (typeof SUPPORTED_TYPES)[number])
  }

  return Effect.fail(new UnknownPrimitiveTypeError({ type: value }))
}

export const runPrimitiveListCommand = (
  targetPath: string,
  typeFilter?: (typeof SUPPORTED_TYPES)[number]
) =>
  Effect.gen(function*() {
    const service = yield* PrimitiveService.PrimitiveService
    const rootPath = path.resolve(targetPath)
    const summaries = yield* service.list(
      rootPath,
      typeFilter === undefined ? undefined : { type: typeFilter }
    )
    const output = formatPrimitiveListSuccessOutput(rootPath, summaries)

    yield* Effect.sync(() => console.log(output))
  }).pipe(Effect.provide(primitiveServiceLiveLayer))

export const primitiveListCommand = Command.make(
  "list",
  { path: projectPath, type: typeOption },
  ({ path: targetPath, type: typeFilter }) =>
    Effect.gen(function*() {
      const typeValue = Option.getOrUndefined(typeFilter)
      const parsedTypeFilter = typeValue === undefined
        ? undefined
        : yield* parsePrimitiveTypeFilter(typeValue)

      return yield* runPrimitiveListCommand(targetPath, parsedTypeFilter)
    })
).pipe(Command.withDescription("List product primitives in a project root"))

const exitWithCode = (code: 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

export const resolvePrimitiveListCommandExit = (
  error: unknown
): undefined | { readonly code: 2; readonly message?: string } => {
  if (Schema.is(UnknownPrimitiveTypeError)(error)) {
    return {
      code: 2,
      message: `Unknown primitive type "${error.type}". Supported types: ${SUPPORTED_TYPES.join(", ")}.`
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
    return { code: 2, message: `Primitive list error: ${error.message}` }
  }

  return undefined
}

export const handlePrimitiveListCommandError = (error: unknown): Effect.Effect<void> => {
  const resolution = resolvePrimitiveListCommandExit(error)

  if (resolution === undefined) {
    return Effect.die(error)
  }

  return exitWithCode(resolution.code, resolution.message)
}

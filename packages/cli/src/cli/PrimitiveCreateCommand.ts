import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors, primitiveErrors, PrimitiveService, PrimitiveSummary } from "@specable/core"
import { Effect } from "effect"
import * as path from "node:path"

import { primitiveServiceLiveLayer } from "../services/Layers.js"
import { formatPrimitiveCreateSuccessOutput, type PrimitiveCreateSuccessDetails } from "./render/PrimitiveOutput.js"

const {
  DuplicatePrimitiveIdError,
  PrimitiveValidationError,
  UnknownPrimitiveTypeError
} = primitiveErrors

const {
  IncompleteProjectError,
  ProjectConfigDecodeError,
  ProjectNotFoundError
} = errors

export const primitiveCreateSetOption = Options.text("set").pipe(Options.atLeast(0))

const projectPath = Args.directory({ name: "path" })
const typeOption = Options.text("type")
const nameOption = Options.text("name")
const statusOption = Options.choice("status", ["Draft", "Active", "Deprecated"]).pipe(
  Options.withDefault("Draft")
)
const setOption = primitiveCreateSetOption

const SUPPORTED_TYPES = [...PrimitiveSummary.ALPHA_PRIMITIVE_TYPES]

export const parsePrimitiveCreateSetEntries = (
  entries: readonly string[]
): Effect.Effect<Record<string, unknown>, InstanceType<typeof PrimitiveValidationError>> => {
  const fields: Record<string, unknown> = {}

  for (const entry of entries) {
    const separatorIndex = entry.indexOf("=")

    if (separatorIndex <= 0 || separatorIndex === entry.length - 1) {
      return Effect.fail(
        new PrimitiveValidationError({
          message: `Invalid --set value "${entry}". Expected key=value.`,
          type: "CLI"
        })
      )
    }

    fields[entry.slice(0, separatorIndex)] = entry.slice(separatorIndex + 1)
  }

  return Effect.succeed(fields)
}

const parsePrimitiveType = (
  value: string
): Effect.Effect<(typeof SUPPORTED_TYPES)[number], InstanceType<typeof UnknownPrimitiveTypeError>> => {
  if ((SUPPORTED_TYPES as readonly string[]).includes(value)) {
    return Effect.succeed(value as (typeof SUPPORTED_TYPES)[number])
  }

  return Effect.fail(new UnknownPrimitiveTypeError({ type: value }))
}

export const runPrimitiveCreateCommand = (
  targetPath: string,
  primitiveType: (typeof SUPPORTED_TYPES)[number],
  displayName: string,
  status: "Active" | "Deprecated" | "Draft",
  setEntries: readonly string[]
) =>
  Effect.gen(function*() {
    const service = yield* PrimitiveService.PrimitiveService
    const rootPath = path.resolve(targetPath)
    const fields = yield* parsePrimitiveCreateSetEntries(setEntries)
    const primitive = yield* service.create({
      fields: Object.keys(fields).length > 0 ? fields : undefined,
      name: displayName,
      rootPath,
      status,
      type: primitiveType
    })

    const output = formatPrimitiveCreateSuccessOutput(
      {
        id: primitive.id,
        name: primitive.name,
        rootPath,
        status: primitive.status,
        type: primitive.type
      } satisfies PrimitiveCreateSuccessDetails
    )

    yield* Effect.sync(() => console.log(output))
  }).pipe(Effect.provide(primitiveServiceLiveLayer))

export const primitiveCreateCommand = Command.make(
  "create",
  { name: nameOption, path: projectPath, set: setOption, status: statusOption, type: typeOption },
  ({ name: displayName, path: targetPath, set: setEntries, status, type: typeValue }) =>
    Effect.gen(function*() {
      const primitiveType = yield* parsePrimitiveType(typeValue)

      return yield* runPrimitiveCreateCommand(targetPath, primitiveType, displayName, status, setEntries)
    })
).pipe(Command.withDescription("Create a product primitive in a project root"))

const exitWithCode = (code: 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

export const resolvePrimitiveCreateCommandExit = (
  error: unknown
): undefined | { readonly code: 2; readonly message?: string } => {
  if (Schema.is(UnknownPrimitiveTypeError)(error)) {
    return {
      code: 2,
      message: `Unknown primitive type "${error.type}". Supported types: ${SUPPORTED_TYPES.join(", ")}.`
    }
  }

  if (Schema.is(PrimitiveValidationError)(error)) {
    const fieldPaths = error.fieldPaths === undefined ? "" : ` (${error.fieldPaths.join(", ")})`

    return {
      code: 2,
      message: `Primitive validation failed for ${error.type}${fieldPaths}: ${error.message}`
    }
  }

  if (Schema.is(DuplicatePrimitiveIdError)(error)) {
    return {
      code: 2,
      message: `Duplicate primitive ID "${error.id}" in project root ${error.path}`
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
    return { code: 2, message: `Primitive create error: ${error.message}` }
  }

  return undefined
}

export const handlePrimitiveCreateCommandError = (error: unknown): Effect.Effect<void> => {
  const resolution = resolvePrimitiveCreateCommandExit(error)

  if (resolution === undefined) {
    return Effect.die(error)
  }

  return exitWithCode(resolution.code, resolution.message)
}

import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors as domainErrors } from "@specable/domain"
import { Effect } from "effect"
import * as Console from "effect/Console"

import {
  BrokenReferenceError,
  CheckScopeUnavailableError,
  DuplicateIdError,
  GraphProjectNotFoundError,
  OutputWriteError,
  ValidationFailedError
} from "../errors.js"

export interface CliExitResolution {
  readonly code: 1 | 2
  readonly message?: string
}

export const resolveCliExitResolution = (error: unknown): CliExitResolution | undefined => {
  if (Schema.is(CheckScopeUnavailableError)(error)) {
    return { code: 2, message: error.message }
  }

  if (Schema.is(GraphProjectNotFoundError)(error)) {
    return { code: 2, message: `Graph project not found: ${error.path}` }
  }

  if (Schema.is(domainErrors.FixtureDecodeError)(error)) {
    return {
      code: 2,
      message: `Fixture decode error in ${error.filePath}: ${error.message}`
    }
  }

  if (Schema.is(OutputWriteError)(error)) {
    return {
      code: 2,
      message: `Failed to write ${error.path}: ${error.message}`
    }
  }

  if (Schema.is(DuplicateIdError)(error)) {
    return {
      code: 1,
      message: `Duplicate primitive ID: ${error.id} (${error.type})`
    }
  }

  if (Schema.is(BrokenReferenceError)(error)) {
    return {
      code: 1,
      message: `Broken reference to ${error.targetId}`
    }
  }

  if (Schema.is(ValidationFailedError)(error)) {
    return { code: 1 }
  }

  if (isPlatformError(error)) {
    return { code: 2, message: `Graph load error: ${error.message}` }
  }

  return undefined
}

const exitProcess = (code: 1 | 2): Effect.Effect<never> => Effect.sync(() => process.exit(code))

export const finalizeCliExit = <E, R>(program: Effect.Effect<void, E, R>): Effect.Effect<void, never, R> =>
  program.pipe(
    Effect.catchAll((error) => {
      const resolution = resolveCliExitResolution(error)

      if (resolution === undefined) {
        return Effect.die(error)
      }

      return Effect.gen(function*() {
        if (resolution.message !== undefined) {
          yield* Console.error(resolution.message)
        }

        return yield* exitProcess(resolution.code)
      })
    })
  )

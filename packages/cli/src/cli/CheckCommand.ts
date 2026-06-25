import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors as domainErrors } from "@specable/domain"
import { Effect } from "effect"

import { GraphProjectNotFoundError, ValidationFailedError } from "../errors.js"
import { GraphRepository } from "../graph/GraphRepository.js"
import { validateProductGraph, validationResultFromDuplicateId } from "../validation/ValidationService.js"
import { renderValidationOutput } from "./render/ValidationOutput.js"

const projectDir = Args.directory({ name: "projectDir" })
const validateOnly = Options.boolean("validate-only")

const fullCheckUnavailableMessage =
  "Full check (validation + integrity + summary) is not available yet. Re-run with --validate-only."

const runValidateOnlyCommand = (projectPath: string) =>
  Effect.gen(function*() {
    const repository = yield* GraphRepository
    const result = yield* repository.load(projectPath).pipe(
      Effect.map(validateProductGraph),
      Effect.catchTag("DuplicateIdError", (duplicate) =>
        Effect.succeed(validationResultFromDuplicateId(duplicate.id, duplicate.type)))
    )

    yield* renderValidationOutput(projectPath, result)

    if (!result.summary.passed) {
      yield* Effect.fail(
        new ValidationFailedError({
          failureCount: result.summary.failureCount
        })
      )
    }
  })

export const checkCommand = Command.make(
  "check",
  { projectDir, validateOnly },
  ({ projectDir: projectPath, validateOnly: isValidateOnly }) =>
    isValidateOnly
      ? runValidateOnlyCommand(projectPath)
      : Effect.zipRight(
        Effect.sync(() => console.error(fullCheckUnavailableMessage)),
        Effect.sync(() => process.exit(2))
      )
).pipe(Command.withDescription("Validate a local product primitive graph project"))

const exitWithCode = (code: 1 | 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

// fallow-ignore-next-line complexity
const resolveCheckCommandExit = (
  error: unknown
): undefined | { readonly code: 1 | 2; readonly message?: string } => {
  if (Schema.is(GraphProjectNotFoundError)(error)) {
    return { code: 2, message: `Graph project not found: ${error.path}` }
  }

  if (Schema.is(domainErrors.FixtureDecodeError)(error)) {
    return {
      code: 2,
      message: `Fixture decode error in ${error.filePath}: ${error.message}`
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

export const handleCheckCommandError = (error: unknown): Effect.Effect<void> => {
  const resolution = resolveCheckCommandExit(error)

  if (resolution === undefined) {
    return Effect.die(error)
  }

  return exitWithCode(resolution.code, resolution.message)
}

import { Args, Command, Options } from "@effect/cli"
import { errors as domainErrors } from "@specable/domain"
import { Effect } from "effect"

import { GraphProjectNotFoundError, ValidationFailedError } from "../errors.js"
import { GraphRepository } from "../graph/GraphRepository.js"
import { validateProductGraph, validationResultFromDuplicateId } from "../validation/ValidationService.js"
import { renderValidationOutput } from "./render/ValidationOutput.js"

const projectDir = Args.directory({ name: "projectDir" })
const validateOnly = Options.boolean("validate-only")

const runCheckCommand = (projectPath: string) =>
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
  ({ projectDir: projectPath }) => runCheckCommand(projectPath)
).pipe(Command.withDescription("Validate a local product primitive graph project"))

export const handleCheckCommandError = (error: unknown): Effect.Effect<void> => {
  if (error instanceof GraphProjectNotFoundError) {
    return Effect.zipRight(
      Effect.sync(() => console.error(`Graph project not found: ${error.path}`)),
      Effect.sync(() => process.exit(2))
    )
  }

  if (error instanceof domainErrors.FixtureDecodeError) {
    return Effect.zipRight(
      Effect.sync(() => console.error(`Fixture decode error in ${error.filePath}: ${error.message}`)),
      Effect.sync(() => process.exit(2))
    )
  }

  if (error instanceof ValidationFailedError) {
    return Effect.sync(() => process.exit(1))
  }

  return Effect.die(error)
}

import { Args, Command, Options } from "@effect/cli"
import { Effect } from "effect"

import { CheckScopeUnavailableError, ValidationFailedError } from "../errors.js"
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
    Effect.gen(function*() {
      if (!isValidateOnly) {
        return yield* Effect.fail(
          new CheckScopeUnavailableError({
            message: fullCheckUnavailableMessage
          })
        )
      }

      yield* runValidateOnlyCommand(projectPath)
    })
).pipe(Command.withDescription("Validate a local product primitive graph project"))

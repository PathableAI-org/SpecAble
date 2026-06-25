import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors as domainErrors } from "@specable/domain"
import { Effect } from "effect"

import { GraphProjectNotFoundError, ValidationFailedError } from "../errors.js"
import { GraphRepository } from "../graph/GraphRepository.js"
import { analyzeProductGraphIntegrity } from "../integrity/IntegrityService.js"
import { validateProductGraph, validationResultFromDuplicateId } from "../validation/ValidationService.js"
import { renderIntegrityOutput } from "./render/IntegrityOutput.js"
import { renderValidationOutput } from "./render/ValidationOutput.js"

const projectDir = Args.directory({ name: "projectDir" })
const validateOnly = Options.boolean("validate-only")
const integrityOnly = Options.boolean("integrity-only")

const fullCheckUnavailableMessage =
  "Full check (validation + integrity + summary) is not available yet. Re-run with --validate-only or --integrity-only."

const loadValidatedGraph = (projectPath: string) =>
  Effect.gen(function*() {
    const repository = yield* GraphRepository

    return yield* repository.load(projectPath).pipe(
      Effect.map((graph) => ({
        graph,
        validation: validateProductGraph(graph)
      })),
      Effect.catchTag("DuplicateIdError", (duplicate) => {
        const validation = validationResultFromDuplicateId(duplicate.id, duplicate.type)

        return Effect.succeed({
          graph: undefined,
          validation
        })
      })
    )
  })

const assertValidationPassed = (
  validation: { readonly summary: { readonly failureCount: number; readonly passed: boolean } }
) =>
  validation.summary.passed
    ? Effect.void
    : Effect.fail(
      new ValidationFailedError({
        failureCount: validation.summary.failureCount
      })
    )

const runValidateOnlyCommand = (projectPath: string) =>
  Effect.gen(function*() {
    const { validation } = yield* loadValidatedGraph(projectPath)

    yield* renderValidationOutput(projectPath, validation)
    yield* assertValidationPassed(validation)
  })

const runIntegrityOnlyCommand = (projectPath: string) =>
  Effect.gen(function*() {
    const loaded = yield* loadValidatedGraph(projectPath)

    yield* renderValidationOutput(projectPath, loaded.validation)

    if (loaded.graph !== undefined) {
      const integrity = analyzeProductGraphIntegrity(loaded.graph, loaded.validation)
      yield* renderIntegrityOutput(integrity)
    }

    yield* assertValidationPassed(loaded.validation)
  })

// fallow-ignore-next-line complexity
const runCheckByMode = (
  projectPath: string,
  isValidateOnly: boolean,
  isIntegrityOnly: boolean
) => {
  if (isValidateOnly && isIntegrityOnly) {
    return Effect.zipRight(
      Effect.sync(() => console.error("Use only one of --validate-only or --integrity-only.")),
      Effect.sync(() => process.exit(2))
    )
  }

  if (isValidateOnly) {
    return runValidateOnlyCommand(projectPath)
  }

  if (isIntegrityOnly) {
    return runIntegrityOnlyCommand(projectPath)
  }

  return Effect.zipRight(
    Effect.sync(() => console.error(fullCheckUnavailableMessage)),
    Effect.sync(() => process.exit(2))
  )
}

export const checkCommand = Command.make(
  "check",
  { integrityOnly, projectDir, validateOnly },
  ({ integrityOnly: isIntegrityOnly, projectDir: projectPath, validateOnly: isValidateOnly }) =>
    runCheckByMode(projectPath, isValidateOnly, isIntegrityOnly)
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

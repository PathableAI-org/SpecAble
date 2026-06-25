import { Args, Command, Options } from "@effect/cli"
import { isPlatformError } from "@effect/platform/Error"
import { Schema } from "@effect/schema"
import { errors as domainErrors } from "@specable/domain"
import { Effect, Option } from "effect"

import type { IntegrityResult } from "../integrity/IntegrityFinding.js"

import {
  GraphProjectNotFoundError,
  OutputWriteError,
  ScopeFlagConflictError,
  ValidationFailedError
} from "../errors.js"
import { GraphRepository } from "../graph/GraphRepository.js"
import { validateProductGraph, validationResultFromDuplicateId } from "../validation/ValidationService.js"
import { buildCheckArtifactsContext, type CheckArtifactsContext, type LoadedGraph } from "./CheckArtifactsPlan.js"
import { writeCheckArtifacts } from "./output/ArtifactWriter.js"
import { type CheckOutputMode, renderCheckOutput } from "./render/CheckOutput.js"

const projectDir = Args.directory({ name: "projectDir" })
const validateOnly = Options.boolean("validate-only")
const integrityOnly = Options.boolean("integrity-only")
const summaryOnly = Options.boolean("summary-only")
const outDir = Options.directory("out").pipe(Options.optional)

const scopeFlagConflictMessage = "Use at most one of --validate-only, --integrity-only, or --summary-only."

const countScopeFlags = (
  isValidateOnly: boolean,
  isIntegrityOnly: boolean,
  isSummaryOnly: boolean
): number => [isValidateOnly, isIntegrityOnly, isSummaryOnly].filter(Boolean).length

const resolveCheckOutputMode = (
  isValidateOnly: boolean,
  isIntegrityOnly: boolean,
  isSummaryOnly: boolean
): CheckOutputMode => {
  if (isValidateOnly) {
    return "validate-only"
  }

  if (isIntegrityOnly) {
    return "integrity-only"
  }

  if (isSummaryOnly) {
    return "summary-only"
  }

  return "full"
}

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

// fallow-ignore-next-line complexity
const resolveArtifactWrite = (
  outputDir: string | undefined,
  loaded: LoadedGraph,
  context: CheckArtifactsContext
): undefined | {
  readonly integrity: IntegrityResult
  readonly outDir: string
  readonly summaryMarkdown: string
} => {
  if (
    outputDir === undefined || loaded.graph === undefined || context.integrity === undefined
    || context.summaryMarkdown === undefined
  ) {
    return undefined
  }

  return {
    integrity: context.integrity,
    outDir: outputDir,
    summaryMarkdown: context.summaryMarkdown
  }
}

const writeArtifactsWhenRequested = (
  projectPath: string,
  outputDir: string | undefined,
  loaded: LoadedGraph,
  context: CheckArtifactsContext
) => {
  const artifactWrite = resolveArtifactWrite(outputDir, loaded, context)

  if (artifactWrite === undefined) {
    return Effect.void
  }

  return writeCheckArtifacts({
    integrity: artifactWrite.integrity,
    outDir: artifactWrite.outDir,
    projectDir: projectPath,
    summaryMarkdown: artifactWrite.summaryMarkdown,
    validation: loaded.validation
  })
}

const runCheckCommand = (
  projectPath: string,
  isValidateOnly: boolean,
  isIntegrityOnly: boolean,
  isSummaryOnly: boolean,
  outputDir: string | undefined
) =>
  Effect.gen(function*() {
    if (countScopeFlags(isValidateOnly, isIntegrityOnly, isSummaryOnly) > 1) {
      return yield* Effect.fail(new ScopeFlagConflictError({ message: scopeFlagConflictMessage }))
    }

    const mode = resolveCheckOutputMode(isValidateOnly, isIntegrityOnly, isSummaryOnly)
    const loaded = yield* loadValidatedGraph(projectPath)
    const context = buildCheckArtifactsContext(loaded, mode, outputDir)

    yield* renderCheckOutput({
      integrity: context.integrity,
      mode,
      projectPath,
      summaryPreview: context.summaryPreview,
      validation: loaded.validation
    })

    yield* writeArtifactsWhenRequested(projectPath, outputDir, loaded, context)
    yield* assertValidationPassed(loaded.validation)
  })

export const checkCommand = Command.make(
  "check",
  { integrityOnly, outDir, projectDir, summaryOnly, validateOnly },
  ({
    integrityOnly: isIntegrityOnly,
    outDir: outputDir,
    projectDir: projectPath,
    summaryOnly: isSummaryOnly,
    validateOnly: isValidateOnly
  }) =>
    runCheckCommand(
      projectPath,
      isValidateOnly,
      isIntegrityOnly,
      isSummaryOnly,
      Option.getOrUndefined(outputDir)
    )
).pipe(Command.withDescription("Validate a local product primitive graph project"))

const exitWithCode = (code: 1 | 2, message?: string): Effect.Effect<void> =>
  Effect.zipRight(
    message === undefined ? Effect.void : Effect.sync(() => console.error(message)),
    Effect.sync(() => process.exit(code))
  )

// fallow-ignore-next-line complexity
export const resolveCheckCommandExit = (
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

  if (Schema.is(OutputWriteError)(error)) {
    return { code: 2, message: `Output write error for ${error.path}: ${error.message}` }
  }

  if (Schema.is(ScopeFlagConflictError)(error)) {
    return { code: 2, message: error.message }
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

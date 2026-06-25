import type { Effect } from "effect"

import * as FileSystem from "@effect/platform/FileSystem"
import { Effect as E } from "effect"
import * as path from "node:path"

import type { IntegrityResult } from "../../integrity/IntegrityFinding.js"
import type { ValidationResult } from "../../validation/ValidationFinding.js"

import { OutputWriteError } from "../../errors.js"
import { encodeIntegrityReport, formatIntegrityReportMarkdown } from "../../integrity/IntegrityReport.js"
import { encodeValidationReport } from "../../validation/ValidationReport.js"

export interface CheckArtifactsInput {
  readonly integrity: IntegrityResult
  readonly outDir: string
  readonly projectDir: string
  readonly summaryMarkdown: string
  readonly validation: ValidationResult
}

export interface CheckResultEnvelope {
  readonly integrity: ReturnType<typeof encodeIntegrityReport>
  readonly passed: boolean
  readonly schemaVersion: 1
  readonly summaryPath: "summary.md"
  readonly validation: ReturnType<typeof encodeValidationReport>
}

const writeUtf8File = (
  fs: FileSystem.FileSystem,
  filePath: string,
  content: string
): E.Effect<void, OutputWriteError> =>
  fs.writeFileString(filePath, content).pipe(
    E.mapError(
      (error) =>
        new OutputWriteError({
          message: error.message,
          path: filePath
        })
    )
  )

const ensureOutputDirectory = (
  fs: FileSystem.FileSystem,
  outDir: string
): E.Effect<void, OutputWriteError> =>
  E.gen(function*() {
    const exists = yield* fs.exists(outDir).pipe(
      E.mapError(
        (error) =>
          new OutputWriteError({
            message: error.message,
            path: outDir
          })
      )
    )

    if (!exists) {
      yield* fs.makeDirectory(outDir, { recursive: true }).pipe(
        E.mapError(
          (error) =>
            new OutputWriteError({
              message: error.message,
              path: outDir
            })
        )
      )
    }
  })

export const encodeCheckResultEnvelope = (
  input: CheckArtifactsInput
): CheckResultEnvelope => ({
  integrity: encodeIntegrityReport(input.projectDir, input.integrity),
  passed: input.validation.summary.passed,
  schemaVersion: 1,
  summaryPath: "summary.md",
  validation: encodeValidationReport(input.projectDir, input.validation)
})

export const writeCheckArtifacts = (
  input: CheckArtifactsInput
): Effect.Effect<void, OutputWriteError, FileSystem.FileSystem> =>
  E.gen(function*() {
    const fs = yield* FileSystem.FileSystem

    yield* ensureOutputDirectory(fs, input.outDir)

    const validationJson = JSON.stringify(
      encodeValidationReport(input.projectDir, input.validation),
      null,
      2
    )
    const integrityJson = JSON.stringify(
      encodeIntegrityReport(input.projectDir, input.integrity),
      null,
      2
    )
    const integrityMarkdown = formatIntegrityReportMarkdown(input.projectDir, input.integrity)
    const checkResultJson = JSON.stringify(encodeCheckResultEnvelope(input), null, 2)

    const writes: readonly (readonly [string, string])[] = [
      [path.join(input.outDir, "summary.md"), input.summaryMarkdown],
      [path.join(input.outDir, "validation.json"), validationJson],
      [path.join(input.outDir, "integrity-report.json"), integrityJson],
      [path.join(input.outDir, "integrity-report.md"), integrityMarkdown],
      [path.join(input.outDir, "check-result.json"), checkResultJson]
    ]

    for (const [filePath, content] of writes) {
      yield* writeUtf8File(fs, filePath, content)
    }
  })

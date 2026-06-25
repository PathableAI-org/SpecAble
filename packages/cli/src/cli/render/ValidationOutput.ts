import type { Effect } from "effect"

import * as Console from "effect/Console"

import type { ValidationFinding, ValidationResult } from "../../validation/ValidationFinding.js"

const renderFindingLines = (
  title: string,
  findings: readonly ValidationFinding[]
): readonly string[] => {
  if (findings.length === 0) {
    return []
  }

  return [
    title,
    ...findings.map(
      (finding) =>
        `- [${finding.severity}] ${finding.primitiveType} ${finding.primitiveId} (${finding.code}) ${finding.field}: ${finding.message}`
    )
  ]
}

export const formatValidationOutput = (projectPath: string, result: ValidationResult): string => {
  const lines = [
    "SpecAble check",
    `Project: ${projectPath}`,
    "",
    "Validation status:",
    result.summary.passed ? "PASSED" : "FAILED",
    `Failures: ${result.summary.failureCount}`,
    `Warnings: ${result.summary.warningCount}`,
    "",
    ...renderFindingLines("Validation failures:", result.failures),
    ...(result.failures.length > 0 ? [""] : []),
    ...renderFindingLines("Validation warnings:", result.warnings)
  ]

  return lines.join("\n")
}

export const renderValidationOutput = (
  projectPath: string,
  result: ValidationResult
): Effect.Effect<void> => Console.log(formatValidationOutput(projectPath, result))

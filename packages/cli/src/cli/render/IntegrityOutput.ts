import type { Effect } from "effect"

import * as Console from "effect/Console"

import type { IntegrityFinding, IntegrityResult } from "../../integrity/IntegrityFinding.js"

import { sortIntegrityFindings } from "../../integrity/IntegrityFinding.js"

const renderWarningLines = (
  title: string,
  findings: readonly IntegrityFinding[]
): readonly string[] => {
  if (findings.length === 0) {
    return []
  }

  return [
    title,
    ...sortIntegrityFindings(findings).map((finding) => {
      const related = finding.relatedIds === undefined || finding.relatedIds.length === 0
        ? ""
        : ` related=${finding.relatedIds.join(",")}`

      return `- [warning] ${finding.primitiveType} ${finding.primitiveId} (${finding.code}) ${finding.field}: ${finding.message}${related}`
    })
  ]
}

const renderTripleSummaryLines = (result: IntegrityResult): readonly string[] => {
  if (result.duplicateStoryTriples.length === 0) {
    return []
  }

  return [
    "Duplicate story triple summary:",
    ...result.duplicateStoryTriples.map(
      (conflict) =>
        `- actor=${conflict.actorId} capability=${conflict.capabilityId} expectedResult=${conflict.expectedResultId} stories=${
          conflict.storyIds.join(",")
        }`
    )
  ]
}

export const formatIntegrityOutput = (result: IntegrityResult): string => {
  const lines = [
    "Integrity status:",
    `Warnings: ${result.summary.warningCount}`,
    "",
    ...renderWarningLines("Integrity warnings:", result.warnings),
    ...(result.warnings.length > 0 ? [""] : []),
    ...renderTripleSummaryLines(result)
  ]

  return lines.filter((line, index, array) => line.length > 0 || index < array.length - 1).join("\n")
}

export const renderIntegrityOutput = (result: IntegrityResult): Effect.Effect<void> =>
  Console.log(formatIntegrityOutput(result))

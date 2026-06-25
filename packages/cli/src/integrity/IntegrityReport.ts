import { Schema } from "@effect/schema"

import {
  IntegrityFinding,
  type IntegrityResult,
  sortIntegrityFindings,
  StoryTripleConflict
} from "./IntegrityFinding.js"

export const IntegrityReportSchema = Schema.Struct({
  duplicateStoryTriples: Schema.Array(StoryTripleConflict),
  findings: Schema.Array(IntegrityFinding),
  projectDir: Schema.String,
  schemaVersion: Schema.Literal(1),
  warningCount: Schema.Number
}).annotations({
  description: "Machine-readable integrity report artifact",
  identifier: "IntegrityReport",
  title: "Integrity Report"
})

export type IntegrityReport = typeof IntegrityReportSchema.Type

export const encodeIntegrityReport = (
  projectDir: string,
  result: IntegrityResult
): IntegrityReport => ({
  duplicateStoryTriples: [...result.duplicateStoryTriples],
  findings: sortIntegrityFindings(result.warnings),
  projectDir,
  schemaVersion: 1,
  warningCount: result.summary.warningCount
})

export const encodeIntegrityReportJson = (
  projectDir: string,
  result: IntegrityResult
): string => JSON.stringify(encodeIntegrityReport(projectDir, result), null, 2)

export const formatIntegrityReportMarkdown = (
  projectDir: string,
  result: IntegrityResult
): string => {
  const lines = [
    "# Integrity Report",
    "",
    `Project: ${projectDir}`,
    `Warnings: ${result.summary.warningCount}`,
    ""
  ]

  if (result.warnings.length > 0) {
    lines.push("## Warnings", "")

    for (const finding of sortIntegrityFindings(result.warnings)) {
      const related = finding.relatedIds === undefined || finding.relatedIds.length === 0
        ? ""
        : ` (related: ${finding.relatedIds.join(", ")})`

      lines.push(
        `- ${finding.primitiveType} ${finding.primitiveId} (${finding.code}) ${finding.field}: ${finding.message}${related}`
      )
    }

    lines.push("")
  }

  if (result.duplicateStoryTriples.length > 0) {
    lines.push("## Duplicate Story Triples", "")

    for (const conflict of result.duplicateStoryTriples) {
      lines.push(
        `- actor=${conflict.actorId}, capability=${conflict.capabilityId}, expectedResult=${conflict.expectedResultId}: stories ${
          conflict.storyIds.join(", ")
        }`
      )
    }
  }

  return lines.join("\n")
}

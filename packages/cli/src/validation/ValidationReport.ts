import { Schema } from "@effect/schema"

import { sortFindings, ValidationFinding, type ValidationResult } from "./ValidationFinding.js"

export const ValidationReportSchema = Schema.Struct({
  failureCount: Schema.Number,
  findings: Schema.Array(ValidationFinding),
  passed: Schema.Boolean,
  projectDir: Schema.String,
  schemaVersion: Schema.Literal(1),
  warningCount: Schema.Number
}).annotations({
  description: "Machine-readable validation report artifact",
  identifier: "ValidationReport",
  title: "Validation Report"
})

export type ValidationReport = typeof ValidationReportSchema.Type

export const encodeValidationReport = (
  projectDir: string,
  result: ValidationResult
): ValidationReport => ({
  failureCount: result.summary.failureCount,
  findings: sortFindings([...result.failures, ...result.warnings]),
  passed: result.summary.passed,
  projectDir,
  schemaVersion: 1,
  warningCount: result.summary.warningCount
})

export const encodeValidationReportJson = (
  projectDir: string,
  result: ValidationResult
): string => JSON.stringify(encodeValidationReport(projectDir, result), null, 2)

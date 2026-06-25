import { Schema } from "@effect/schema"
import { PrimitiveBase, PrimitiveType } from "@specable/domain"

export const ValidationSeverity = Schema.Literal("warning", "failure").annotations({
  description: "Severity of a validation finding",
  identifier: "ValidationSeverity",
  title: "Validation Severity"
})

export type ValidationSeverity = typeof ValidationSeverity.Type

export const ValidationFindingCode = Schema.Literal(
  "missing-field",
  "missing-relationship",
  "broken-reference",
  "duplicate-id",
  "duplicate-story-triple",
  "invalid-literal"
).annotations({
  description: "Machine-readable validation finding code",
  identifier: "ValidationFindingCode",
  title: "Validation Finding Code"
})

export type ValidationFindingCode = typeof ValidationFindingCode.Type

export const ValidationFinding = Schema.Struct({
  code: ValidationFindingCode,
  field: Schema.String.annotations({
    description: "Field or relationship path associated with the finding",
    identifier: "ValidationFindingField",
    title: "Field"
  }),
  message: Schema.String.annotations({
    description: "Human-readable validation message",
    identifier: "ValidationFindingMessage",
    title: "Message"
  }),
  primitiveId: PrimitiveBase.PrimitiveId.annotations({
    description: "Primitive identifier the finding applies to",
    identifier: "ValidationFindingPrimitiveId",
    title: "Primitive ID"
  }),
  primitiveType: PrimitiveType.annotations({
    description: "Primitive type the finding applies to",
    identifier: "ValidationFindingPrimitiveType",
    title: "Primitive Type"
  }),
  severity: ValidationSeverity.annotations({
    description: "Whether the finding is a warning or failure",
    identifier: "ValidationFindingSeverity",
    title: "Severity"
  })
}).annotations({
  description: "Structured validation issue for a specific primitive",
  identifier: "ValidationFinding",
  title: "Validation Finding"
})

export type ValidationFinding = typeof ValidationFinding.Type

export const ValidationSummary = Schema.Struct({
  failureCount: Schema.Number,
  passed: Schema.Boolean,
  warningCount: Schema.Number
}).annotations({
  description: "Roll-up counts for a validation run",
  identifier: "ValidationSummary",
  title: "Validation Summary"
})

export interface ValidationResult {
  readonly failures: readonly ValidationFinding[]
  readonly summary: ValidationSummary
  readonly warnings: readonly ValidationFinding[]
}

export type ValidationSummary = typeof ValidationSummary.Type

export const emptyValidationResult = (): ValidationResult => ({
  failures: [],
  summary: {
    failureCount: 0,
    passed: true,
    warningCount: 0
  },
  warnings: []
})

export const compareFindings = (left: ValidationFinding, right: ValidationFinding): number => {
  const severityRank = (severity: ValidationSeverity): number => (severity === "failure" ? 0 : 1)
  const bySeverity = severityRank(left.severity) - severityRank(right.severity)

  if (bySeverity !== 0) {
    return bySeverity
  }

  const byType = left.primitiveType.localeCompare(right.primitiveType)

  if (byType !== 0) {
    return byType
  }

  const byId = left.primitiveId.localeCompare(right.primitiveId)

  if (byId !== 0) {
    return byId
  }

  return left.code.localeCompare(right.code)
}

export const sortFindings = (
  findings: readonly ValidationFinding[]
): readonly ValidationFinding[] => [...findings].sort(compareFindings)

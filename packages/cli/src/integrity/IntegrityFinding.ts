import { Schema } from "@effect/schema"
import { PrimitiveBase, PrimitiveType } from "@specable/domain"

export const IntegrityFindingCode = Schema.Literal(
  "duplicate-name",
  "likely-duplicate-name",
  "orphan",
  "missing-workflow-derivation"
).annotations({
  description: "Machine-readable integrity finding code",
  identifier: "IntegrityFindingCode",
  title: "Integrity Finding Code"
})

export type IntegrityFindingCode = typeof IntegrityFindingCode.Type

export const IntegrityFinding = Schema.Struct({
  code: IntegrityFindingCode,
  field: Schema.String.annotations({
    description: "Field or relationship path associated with the finding",
    identifier: "IntegrityFindingField",
    title: "Field"
  }),
  message: Schema.String.annotations({
    description: "Human-readable integrity message",
    identifier: "IntegrityFindingMessage",
    title: "Message"
  }),
  primitiveId: PrimitiveBase.PrimitiveId.annotations({
    description: "Primary primitive identifier the finding applies to",
    identifier: "IntegrityFindingPrimitiveId",
    title: "Primitive ID"
  }),
  primitiveType: PrimitiveType.annotations({
    description: "Primary primitive type the finding applies to",
    identifier: "IntegrityFindingPrimitiveType",
    title: "Primitive Type"
  }),
  relatedIds: Schema.optional(
    Schema.Array(PrimitiveBase.PrimitiveId).annotations({
      description: "Related primitive identifiers for duplicate and conflict findings",
      identifier: "IntegrityFindingRelatedIds",
      title: "Related IDs"
    })
  ),
  severity: Schema.Literal("warning").annotations({
    description: "Integrity findings are warnings in v0",
    identifier: "IntegrityFindingSeverity",
    title: "Severity"
  })
}).annotations({
  description: "Structured integrity issue for cross-primitive graph heuristics",
  identifier: "IntegrityFinding",
  title: "Integrity Finding"
})

export type IntegrityFinding = typeof IntegrityFinding.Type

export const StoryTripleConflict = Schema.Struct({
  actorId: PrimitiveBase.PrimitiveId,
  capabilityId: PrimitiveBase.PrimitiveId,
  expectedResultId: PrimitiveBase.PrimitiveId,
  storyIds: Schema.Array(PrimitiveBase.PrimitiveId)
}).annotations({
  description: "Summary of Active stories sharing the same actor-capability-expected-result triple",
  identifier: "StoryTripleConflict",
  title: "Story Triple Conflict"
})

export interface IntegrityResult {
  readonly duplicateStoryTriples: readonly StoryTripleConflict[]
  readonly summary: IntegritySummary
  readonly warnings: readonly IntegrityFinding[]
}

export type StoryTripleConflict = typeof StoryTripleConflict.Type

export const IntegritySummary = Schema.Struct({
  warningCount: Schema.Number
}).annotations({
  description: "Roll-up counts for an integrity run",
  identifier: "IntegritySummary",
  title: "Integrity Summary"
})

export type IntegritySummary = typeof IntegritySummary.Type

export const emptyIntegrityResult = (): IntegrityResult => ({
  duplicateStoryTriples: [],
  summary: {
    warningCount: 0
  },
  warnings: []
})

export const compareIntegrityFindings = (
  left: IntegrityFinding,
  right: IntegrityFinding
): number => {
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

export const sortIntegrityFindings = (
  findings: readonly IntegrityFinding[]
): readonly IntegrityFinding[] => [...findings].sort(compareIntegrityFindings)

import type { PrimitiveType } from "@specable/domain"
import type { PrimitiveBase } from "@specable/domain"

import type { ValidationFindingCode } from "../ValidationFinding.js"

export type PrimitiveId = PrimitiveBase.PrimitiveId

export interface RuleIssue {
  readonly code: ValidationFindingCode
  readonly field: string
  readonly kind: RuleIssueKind
  readonly message: string
  readonly primitiveId: PrimitiveId
  readonly primitiveType: PrimitiveType
}

export type RuleIssueKind = "advisory" | "required"

export const requiredFieldIssue = (
  primitiveType: PrimitiveType,
  primitiveId: PrimitiveId,
  field: string,
  message: string
): RuleIssue => ({
  code: "missing-field",
  field,
  kind: "required",
  message,
  primitiveId,
  primitiveType
})

export const requiredRelationshipIssue = (
  primitiveType: PrimitiveType,
  primitiveId: PrimitiveId,
  field: string,
  message: string
): RuleIssue => ({
  code: "missing-relationship",
  field,
  kind: "required",
  message,
  primitiveId,
  primitiveType
})

export const advisoryIssue = (
  primitiveType: PrimitiveType,
  primitiveId: PrimitiveId,
  field: string,
  message: string,
  code: ValidationFindingCode
): RuleIssue => ({
  code,
  field,
  kind: "advisory",
  message,
  primitiveId,
  primitiveType
})

const implementationShapePattern = /\b(api|button|table|payload|sql|ui component|database|endpoint|json schema)\b/i

export const looksImplementationSpecific = (value: string): boolean => implementationShapePattern.test(value)

const taskLikePattern = /\b(click|submit|open|navigate|send request|call api)\b/i

export const looksVagueOrTaskLike = (value: string): boolean =>
  value.trim().split(/\s+/).length <= 2 || taskLikePattern.test(value)

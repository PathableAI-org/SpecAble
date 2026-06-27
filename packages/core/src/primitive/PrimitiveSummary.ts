import { Schema } from "@effect/schema"
import { Status } from "@specable/domain"

export const ALPHA_PRIMITIVE_TYPES = [
  "Objective",
  "Actor",
  "Persona",
  "DomainConcept",
  "Capability",
  "ExpectedResult",
  "Workflow",
  "Story"
] as const

export const AlphaPrimitiveType = Schema.Literal(...ALPHA_PRIMITIVE_TYPES).annotations({
  description: "Alpha primitive types supported at create/list/get boundaries",
  identifier: "AlphaPrimitiveType",
  title: "Alpha Primitive Type"
})

export type AlphaPrimitiveType = typeof AlphaPrimitiveType.Type

export const PrimitiveSummary = Schema.Struct({
  id: Schema.NonEmptyString.annotations({
    description: "Stable primitive identifier",
    identifier: "PrimitiveSummaryId",
    title: "ID"
  }),
  name: Schema.NonEmptyString.annotations({
    description: "Display name",
    identifier: "PrimitiveSummaryName",
    title: "Name"
  }),
  status: Status.annotations({
    description: "Lifecycle status",
    identifier: "PrimitiveSummaryStatus",
    title: "Status"
  }),
  type: AlphaPrimitiveType.annotations({
    description: "Canonical primitive type",
    identifier: "PrimitiveSummaryType",
    title: "Type"
  })
}).annotations({
  description: "Lightweight list projection for primitive instances",
  identifier: "PrimitiveSummary",
  title: "Primitive Summary"
})

export type PrimitiveSummary = typeof PrimitiveSummary.Type

/**
 * Canonical v0 primitive type names in stable alphabetical order.
 * Matches `primitiveTypes` written to `specable.json` at init.
 */
export const CANONICAL_PRIMITIVE_TYPES = [
  "Actor",
  "Capability",
  "CapabilityConceptLink",
  "DomainConcept",
  "ExpectedResult",
  "Objective",
  "Persona",
  "Story",
  "Workflow"
] as const

export type CanonicalPrimitiveType = (typeof CANONICAL_PRIMITIVE_TYPES)[number]

/** Maps each canonical type to its v0-compatible JSON filename. */
export const PRIMITIVE_TYPE_FILES: Record<CanonicalPrimitiveType, string> = {
  Actor: "actors.json",
  Capability: "capabilities.json",
  CapabilityConceptLink: "capability-concept-links.json",
  DomainConcept: "domain-concepts.json",
  ExpectedResult: "expected-results.json",
  Objective: "objectives.json",
  Persona: "personas.json",
  Story: "stories.json",
  Workflow: "workflows.json"
}

export const PRIMITIVE_TYPE_FILE_ENTRIES = CANONICAL_PRIMITIVE_TYPES.map((type) => ({
  fileName: PRIMITIVE_TYPE_FILES[type],
  type
}))

/** Alpha list/get file entries — excludes decode-only CapabilityConceptLink. */
export const ALPHA_PRIMITIVE_TYPE_FILE_ENTRIES = PRIMITIVE_TYPE_FILE_ENTRIES.filter(
  ({ type }) => type !== "CapabilityConceptLink"
)

export const isCanonicalPrimitiveType = (type: string): type is CanonicalPrimitiveType =>
  (CANONICAL_PRIMITIVE_TYPES as readonly string[]).includes(type)

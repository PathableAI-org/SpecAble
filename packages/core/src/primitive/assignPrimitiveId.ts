import { randomBytes } from "node:crypto"

import type { AlphaPrimitiveType } from "./PrimitiveSummary.js"

const TYPE_PREFIXES: Record<AlphaPrimitiveType, string> = {
  Actor: "actor-",
  Capability: "cap-",
  DomainConcept: "concept-",
  ExpectedResult: "result-",
  Objective: "obj-",
  Persona: "persona-",
  Story: "story-",
  Workflow: "workflow-"
}

const slugifyName = (name: string): string => {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug.length > 0 ? slug : "primitive"
}

const randomBase36Suffix = (length: number): string => {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
  const bytes = randomBytes(length)
  let suffix = ""

  for (let index = 0; index < length; index += 1) {
    suffix += alphabet[bytes[index]! % alphabet.length]
  }

  return suffix
}

/**
 * Assign a system ID using `{typePrefix}-{slug(name)}-{suffix}` per research R1.
 */
export const assignPrimitiveId = (type: AlphaPrimitiveType, name: string): string => {
  const prefix = TYPE_PREFIXES[type]
  const slug = slugifyName(name)
  const suffix = randomBase36Suffix(4)

  return `${prefix}${slug}-${suffix}`
}

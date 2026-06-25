import type { Persona } from "@specable/domain"

import { hasNonEmptyText, hasPrimaryActorReference } from "../ReferenceUtils.js"
import { requiredFieldIssue, requiredRelationshipIssue, type RuleIssue } from "./shared.js"

export const evaluatePersonaRules = (persona: Persona): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasPrimaryActorReference(persona.primaryActors)) {
    issues.push(
      requiredRelationshipIssue(
        "Persona",
        persona.id,
        "primaryActors",
        "Active Persona must link to at least one Primary Actor"
      )
    )
  }

  if (!hasNonEmptyText(persona.description)) {
    issues.push(
      requiredFieldIssue(
        "Persona",
        persona.id,
        "description",
        "Active Persona must include description or context"
      )
    )
  }

  if (!hasNonEmptyText(persona.goalsOrPainPoints)) {
    issues.push(
      requiredFieldIssue(
        "Persona",
        persona.id,
        "goalsOrPainPoints",
        "Active Persona must include goals or pain points/constraints"
      )
    )
  }

  if (persona.confidence !== "Hypothesis" && !hasNonEmptyText(persona.evidence)) {
    issues.push(
      requiredFieldIssue(
        "Persona",
        persona.id,
        "evidence",
        "Active Persona must include evidence unless confidence is Hypothesis"
      )
    )
  }

  return issues
}

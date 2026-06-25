import type { DomainConcept } from "@specable/domain"

import type { ProductGraph } from "../../graph/ProductGraph.js"

import { hasNonEmptyText, referenceId } from "../ReferenceUtils.js"
import { advisoryIssue, looksImplementationSpecific, requiredFieldIssue, type RuleIssue } from "./shared.js"

export const evaluateDomainConceptRules = (
  concept: DomainConcept,
  graph: ProductGraph
): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasNonEmptyText(concept.definition)) {
    issues.push(
      requiredFieldIssue(
        "DomainConcept",
        concept.id,
        "definition",
        "Active Domain Concept must include a definition"
      )
    )
  }

  if (!hasNonEmptyText(concept.evidence) && !hasCapabilityConceptLinks(concept, graph)) {
    issues.push(
      advisoryIssue(
        "DomainConcept",
        concept.id,
        "evidence",
        "Domain Concept has no related Capability Concept Links and no evidence reference"
      )
    )
  }

  if (looksImplementationSpecific(`${concept.name} ${concept.definition ?? ""}`)) {
    issues.push(
      advisoryIssue(
        "DomainConcept",
        concept.id,
        "name",
        "Domain Concept appears implementation-shaped rather than semantic"
      )
    )
  }

  return issues
}

const hasCapabilityConceptLinks = (concept: DomainConcept, graph: ProductGraph): boolean =>
  graph.primitives.some((primitive) => {
    if (primitive.type !== "CapabilityConceptLink") {
      return false
    }

    return (
      primitive.domainConcept !== undefined &&
      referenceId(primitive.domainConcept) === concept.id
    )
  })

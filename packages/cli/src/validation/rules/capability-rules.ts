import type { Capability } from "@specable/domain"

import type { ProductGraph } from "../../graph/ProductGraph.js"

import { hasReferences, referenceId } from "../ReferenceUtils.js"
import { advisoryIssue, looksImplementationSpecific, requiredRelationshipIssue, type RuleIssue } from "./shared.js"

export const evaluateCapabilityRules = (
  capability: Capability,
  graph: ProductGraph
): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasReferences(capability.actors)) {
    issues.push(
      requiredRelationshipIssue(
        "Capability",
        capability.id,
        "actors",
        "Active Capability must link to at least one Actor"
      )
    )
  }

  if (!hasReferences(capability.expectedResults)) {
    issues.push(
      requiredRelationshipIssue(
        "Capability",
        capability.id,
        "expectedResults",
        "Active Capability must link to at least one Expected Result"
      )
    )
  }

  if (!hasReferences(capability.workflows)) {
    issues.push(
      requiredRelationshipIssue(
        "Capability",
        capability.id,
        "workflows",
        "Active Capability must link to at least one Workflow"
      )
    )
  }

  if (!hasDomainConceptLink(capability, graph)) {
    issues.push(
      requiredRelationshipIssue(
        "Capability",
        capability.id,
        "domainConcepts",
        "Active Capability must link to at least one Domain Concept"
      )
    )
  }

  const label = `${capability.name} ${capability.description ?? ""}`

  if (looksImplementationSpecific(label)) {
    issues.push(
      advisoryIssue(
        "Capability",
        capability.id,
        "name",
        "Capability appears implementation-specific",
        "missing-field"
      )
    )
  }

  return issues
}

const hasDomainConceptLink = (capability: Capability, graph: ProductGraph): boolean => {
  if (hasReferences(capability.domainConcepts)) {
    return true
  }

  return graph.primitives.some((primitive) => {
    if (primitive.type !== "CapabilityConceptLink") {
      return false
    }

    return (
      primitive.capability !== undefined && referenceId(primitive.capability) === capability.id
    )
  })
}

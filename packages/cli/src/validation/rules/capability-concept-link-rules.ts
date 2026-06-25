import type { CapabilityConceptLink } from "@specable/domain"

import { hasSingleReference } from "../ReferenceUtils.js"
import { requiredFieldIssue, requiredRelationshipIssue, type RuleIssue } from "./shared.js"

export const evaluateCapabilityConceptLinkRules = (
  link: CapabilityConceptLink
): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasSingleReference(link.capability)) {
    issues.push(
      requiredRelationshipIssue(
        "CapabilityConceptLink",
        link.id,
        "capability",
        "Active Capability Concept Link must reference exactly one Capability"
      )
    )
  }

  if (!hasSingleReference(link.domainConcept)) {
    issues.push(
      requiredRelationshipIssue(
        "CapabilityConceptLink",
        link.id,
        "domainConcept",
        "Active Capability Concept Link must reference exactly one Domain Concept"
      )
    )
  }

  if (link.role === undefined) {
    issues.push(
      requiredFieldIssue(
        "CapabilityConceptLink",
        link.id,
        "role",
        "Active Capability Concept Link must include a concept role"
      )
    )
  }

  if (link.importance === undefined) {
    issues.push(
      requiredFieldIssue(
        "CapabilityConceptLink",
        link.id,
        "importance",
        "Active Capability Concept Link must include an importance value"
      )
    )
  }

  return issues
}

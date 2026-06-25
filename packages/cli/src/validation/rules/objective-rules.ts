import type { Objective } from "@specable/domain"

import { hasNonEmptyText, hasReferences } from "../ReferenceUtils.js"
import { requiredFieldIssue, requiredRelationshipIssue, type RuleIssue } from "./shared.js"

export const evaluateObjectiveRules = (objective: Objective): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasNonEmptyText(objective.description)) {
    issues.push(
      requiredFieldIssue(
        "Objective",
        objective.id,
        "description",
        "Active Objective must include a description"
      )
    )
  }

  if (!hasNonEmptyText(objective.successCriteria)) {
    issues.push(
      requiredFieldIssue(
        "Objective",
        objective.id,
        "successCriteria",
        "Active Objective must include success criteria or outcome framing"
      )
    )
  }

  if (!hasReferences(objective.workflows) && !hasReferences(objective.expectedResults)) {
    issues.push(
      requiredRelationshipIssue(
        "Objective",
        objective.id,
        "workflows",
        "Active Objective must link to at least one Workflow or Expected Result"
      )
    )
  }

  return issues
}

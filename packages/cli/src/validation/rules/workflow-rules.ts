import type { Workflow } from "@specable/domain"

import { hasNonEmptyText, hasPrimaryActorReference, hasReferences } from "../ReferenceUtils.js"
import { requiredFieldIssue, requiredRelationshipIssue, type RuleIssue } from "./shared.js"

export const evaluateWorkflowRules = (workflow: Workflow): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasReferences(workflow.objectives)) {
    issues.push(
      requiredRelationshipIssue(
        "Workflow",
        workflow.id,
        "objectives",
        "Active Workflow must link to at least one Objective"
      )
    )
  }

  if (!hasPrimaryActorReference(workflow.primaryActors)) {
    issues.push(
      requiredRelationshipIssue(
        "Workflow",
        workflow.id,
        "primaryActors",
        "Active Workflow must link to at least one Primary Actor"
      )
    )
  }

  if (!hasReferences(workflow.capabilities)) {
    issues.push(
      requiredRelationshipIssue(
        "Workflow",
        workflow.id,
        "capabilities",
        "Active Workflow must link to at least one Capability"
      )
    )
  }

  if (!hasReferences(workflow.stories)) {
    issues.push(
      requiredRelationshipIssue(
        "Workflow",
        workflow.id,
        "stories",
        "Active Workflow must link to at least one Story"
      )
    )
  }

  if (!hasNonEmptyText(workflow.description) && !hasNonEmptyText(workflow.sequenceNotes)) {
    issues.push(
      requiredFieldIssue(
        "Workflow",
        workflow.id,
        "description",
        "Active Workflow must include description or sequence notes"
      )
    )
  }

  return issues
}

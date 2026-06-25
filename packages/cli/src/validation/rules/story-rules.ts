import type { Story } from "@specable/domain"

import { hasReferences, hasSingleReference } from "../ReferenceUtils.js"
import { requiredRelationshipIssue, type RuleIssue } from "./shared.js"

export const evaluateStoryRules = (story: Story): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasSingleReference(story.actor)) {
    issues.push(
      requiredRelationshipIssue(
        "Story",
        story.id,
        "actor",
        "Active Story must link to exactly one Actor"
      )
    )
  }

  if (!hasSingleReference(story.capability)) {
    issues.push(
      requiredRelationshipIssue(
        "Story",
        story.id,
        "capability",
        "Active Story must link to exactly one Capability"
      )
    )
  }

  if (!hasSingleReference(story.expectedResult)) {
    issues.push(
      requiredRelationshipIssue(
        "Story",
        story.id,
        "expectedResult",
        "Active Story must link to exactly one Expected Result"
      )
    )
  }

  if (!hasReferences(story.workflows)) {
    issues.push(
      requiredRelationshipIssue(
        "Story",
        story.id,
        "workflows",
        "Active Story must link to at least one Workflow"
      )
    )
  }

  return issues
}

import type { ExpectedResult } from "@specable/domain"

import type { ProductGraph } from "../../graph/ProductGraph.js"

import { hasNonEmptyText, hasReferences } from "../ReferenceUtils.js"
import {
  advisoryIssue,
  looksImplementationSpecific,
  looksVagueOrTaskLike,
  requiredFieldIssue,
  requiredRelationshipIssue,
  type RuleIssue
} from "./shared.js"

export const evaluateExpectedResultRules = (
  expectedResult: ExpectedResult,
  graph: ProductGraph
): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (looksVagueOrTaskLike(expectedResult.name)) {
    issues.push(
      advisoryIssue(
        "ExpectedResult",
        expectedResult.id,
        "name",
        "Expected Result name should be state-like rather than vague or task-like",
        "vague-expected-result"
      )
    )
  }

  if (!hasNonEmptyText(expectedResult.definition) && !hasNonEmptyText(expectedResult.notes)) {
    issues.push(
      requiredFieldIssue(
        "ExpectedResult",
        expectedResult.id,
        "definition",
        "Active Expected Result must include a definition or notes"
      )
    )
  }

  if (!hasReferences(expectedResult.capabilities)) {
    issues.push(
      requiredRelationshipIssue(
        "ExpectedResult",
        expectedResult.id,
        "capabilities",
        "Active Expected Result must link to at least one producing Capability"
      )
    )
  }

  if (!hasReferences(expectedResult.objectives)) {
    issues.push(
      requiredRelationshipIssue(
        "ExpectedResult",
        expectedResult.id,
        "objectives",
        "Active Expected Result must link to at least one supported Objective"
      )
    )
  }

  if (looksImplementationSpecific(`${expectedResult.name} ${expectedResult.definition ?? ""}`)) {
    issues.push(
      advisoryIssue(
        "ExpectedResult",
        expectedResult.id,
        "definition",
        "Expected Result appears implementation-specific",
        "implementation-specific"
      )
    )
  }

  if (matchesDomainConceptName(expectedResult.name, graph)) {
    issues.push(
      advisoryIssue(
        "ExpectedResult",
        expectedResult.id,
        "name",
        "Expected Result name is indistinguishable from a Domain Concept name",
        "vague-expected-result"
      )
    )
  }

  return issues
}

const matchesDomainConceptName = (name: string, graph: ProductGraph): boolean => {
  const normalized = name.trim().toLowerCase()

  return graph.primitives.some((primitive) => {
    if (primitive.type !== "DomainConcept") {
      return false
    }

    return primitive.name.trim().toLowerCase() === normalized
  })
}

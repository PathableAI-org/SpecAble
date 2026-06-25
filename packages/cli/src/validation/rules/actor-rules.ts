import type { Actor } from "@specable/domain"

import type { ProductGraph } from "../../graph/ProductGraph.js"

import { collectPrimitiveReferences, hasNonEmptyText } from "../ReferenceUtils.js"
import { advisoryIssue, requiredFieldIssue, type RuleIssue } from "./shared.js"

export const evaluateActorRules = (actor: Actor, graph: ProductGraph): readonly RuleIssue[] => {
  const issues: RuleIssue[] = []

  if (!hasNonEmptyText(actor.description)) {
    issues.push(
      requiredFieldIssue("Actor", actor.id, "description", "Active Actor must include a description")
    )
  }

  if (actor.category === undefined) {
    issues.push(
      requiredFieldIssue("Actor", actor.id, "category", "Active Actor must include a category")
    )
  }

  if (actor.status === "Active" && !isActorConnected(actor.id, graph)) {
    issues.push(
      advisoryIssue(
        "Actor",
        actor.id,
        "relationships",
        "Active Actor is not connected to any Workflow, Capability, Story, or Expected Result"
      )
    )
  }

  return issues
}

const isActorConnected = (actorId: Actor["id"], graph: ProductGraph): boolean => {
  for (const primitive of graph.primitives) {
    const references = collectPrimitiveReferences(primitive)

    if (references.some((reference) => reference.targetId === actorId)) {
      return true
    }
  }

  return false
}

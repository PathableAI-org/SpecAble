import type { Primitive } from "@specable/domain"

import type { ProductGraph } from "../../graph/ProductGraph.js"
import type { RuleIssue } from "./shared.js"

import { evaluateActorRules } from "./actor-rules.js"
import { evaluateCapabilityConceptLinkRules } from "./capability-concept-link-rules.js"
import { evaluateCapabilityRules } from "./capability-rules.js"
import { evaluateDomainConceptRules } from "./domain-concept-rules.js"
import { evaluateExpectedResultRules } from "./expected-result-rules.js"
import { evaluateObjectiveRules } from "./objective-rules.js"
import { evaluatePersonaRules } from "./persona-rules.js"
import { evaluateStoryRules } from "./story-rules.js"
import { evaluateWorkflowRules } from "./workflow-rules.js"

export const evaluatePrimitiveRules = (
  primitive: Primitive,
  graph: ProductGraph
): readonly RuleIssue[] => {
  switch (primitive.type) {
    case "Actor":
      return evaluateActorRules(primitive, graph)
    case "Capability":
      return evaluateCapabilityRules(primitive, graph)
    case "CapabilityConceptLink":
      return evaluateCapabilityConceptLinkRules(primitive)
    case "DomainConcept":
      return evaluateDomainConceptRules(primitive, graph)
    case "ExpectedResult":
      return evaluateExpectedResultRules(primitive, graph)
    case "Objective":
      return evaluateObjectiveRules(primitive)
    case "Persona":
      return evaluatePersonaRules(primitive)
    case "Story":
      return evaluateStoryRules(primitive)
    case "Workflow":
      return evaluateWorkflowRules(primitive)
  }
}

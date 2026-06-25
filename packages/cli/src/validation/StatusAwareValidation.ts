import type { Primitive } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"
import type { RuleIssue } from "./rules/shared.js"
import type { ValidationFinding, ValidationSeverity } from "./ValidationFinding.js"

import { isReferencedByActivePrimitive } from "./ReferenceUtils.js"
import { evaluatePrimitiveRules } from "./rules/index.js"

const severityForIssue = (primitive: Primitive, issue: RuleIssue, graph: ProductGraph): null | ValidationSeverity => {
  if (primitive.status === "Deprecated") {
    if (!isReferencedByActivePrimitive(primitive.id, graph.index)) {
      return null
    }

    return issue.kind === "advisory" ? "warning" : "failure"
  }

  if (primitive.status === "Draft") {
    return "warning"
  }

  return issue.kind === "advisory" ? "warning" : "failure"
}

const toFinding = (issue: RuleIssue, severity: ValidationSeverity): ValidationFinding => ({
  code: issue.code,
  field: issue.field,
  message: issue.message,
  primitiveId: issue.primitiveId,
  primitiveType: issue.primitiveType,
  severity
})

export const evaluateStatusAwareRules = (graph: ProductGraph): readonly ValidationFinding[] => {
  const findings: ValidationFinding[] = []

  for (const primitive of graph.primitives) {
    if (primitive.status === "Deprecated" && !isReferencedByActivePrimitive(primitive.id, graph.index)) {
      continue
    }

    const issues = evaluatePrimitiveRules(primitive, graph)

    for (const issue of issues) {
      const severity = severityForIssue(primitive, issue, graph)

      if (severity === null) {
        continue
      }

      findings.push(toFinding(issue, severity))
    }
  }

  return findings
}

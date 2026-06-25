import type { Workflow } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"

import { hasReferences, referenceId, referenceIds } from "../validation/ReferenceUtils.js"
import { type IntegrityFinding, sortIntegrityFindings } from "./IntegrityFinding.js"

const missingDerivationFinding = (
  workflow: Workflow,
  field: "domainConcepts" | "expectedResults",
  detail: string
): IntegrityFinding => ({
  code: "missing-workflow-derivation",
  field,
  message: `Active Workflow "${workflow.name}" is missing ${detail}`,
  primitiveId: workflow.id,
  primitiveType: "Workflow",
  severity: "warning"
})

const hasDerivedExpectedResults = (workflow: Workflow, graph: ProductGraph): boolean => {
  for (const capabilityId of referenceIds(workflow.capabilities)) {
    const capability = graph.index.nodes.get(capabilityId)

    if (capability?.type === "Capability" && hasReferences(capability.expectedResults)) {
      return true
    }
  }

  return false
}

const hasDerivedDomainConcepts = (workflow: Workflow, graph: ProductGraph): boolean => {
  for (const capabilityId of referenceIds(workflow.capabilities)) {
    const capability = graph.index.nodes.get(capabilityId)

    if (capability?.type === "Capability" && hasReferences(capability.domainConcepts)) {
      return true
    }

    const hasConceptLink = graph.primitives.some((primitive) => {
      if (primitive.type !== "CapabilityConceptLink" || primitive.capability === undefined) {
        return false
      }

      return referenceId(primitive.capability) === capabilityId
    })

    if (hasConceptLink) {
      return true
    }
  }

  return false
}

export const findWorkflowDerivationWarnings = (
  graph: ProductGraph
): readonly IntegrityFinding[] => {
  const findings: IntegrityFinding[] = []

  for (const primitive of graph.primitives) {
    if (primitive.type !== "Workflow" || primitive.status !== "Active") {
      continue
    }

    const hasExplicitExpectedResults = hasReferences(primitive.expectedResults)
    const hasExplicitDomainConcepts = hasReferences(primitive.domainConcepts)
    const hasDerivedExpectedResultsResult = hasDerivedExpectedResults(primitive, graph)
    const hasDerivedDomainConceptsResult = hasDerivedDomainConcepts(primitive, graph)

    if (!hasExplicitExpectedResults && !hasDerivedExpectedResultsResult) {
      findings.push(
        missingDerivationFinding(
          primitive,
          "expectedResults",
          "explicit or capability-derived Expected Results"
        )
      )
    }

    if (!hasExplicitDomainConcepts && !hasDerivedDomainConceptsResult) {
      findings.push(
        missingDerivationFinding(
          primitive,
          "domainConcepts",
          "explicit or capability-derived Domain Concepts"
        )
      )
    }
  }

  return sortIntegrityFindings(findings)
}

import type { PrimitiveBase } from "@specable/domain"

import { Effect } from "effect"

import type { ProductGraph } from "../graph/ProductGraph.js"

import { evaluateStatusAwareRules } from "./StatusAwareValidation.js"
import { duplicateIdFinding, findBrokenReferences, findDuplicateStoryTriples } from "./StructuralValidation.js"
import { sortFindings, type ValidationFinding, type ValidationResult } from "./ValidationFinding.js"

const partitionFindings = (
  findings: readonly ValidationFinding[]
): Pick<ValidationResult, "failures" | "warnings"> => {
  const failures: ValidationFinding[] = []
  const warnings: ValidationFinding[] = []

  for (const finding of findings) {
    if (finding.severity === "failure") {
      failures.push(finding)
    } else {
      warnings.push(finding)
    }
  }

  return {
    failures: sortFindings(failures),
    warnings: sortFindings(warnings)
  }
}

const buildResult = (findings: readonly ValidationFinding[]): ValidationResult => {
  const { failures, warnings } = partitionFindings(findings)

  return {
    failures,
    summary: {
      failureCount: failures.length,
      passed: failures.length === 0,
      warningCount: warnings.length
    },
    warnings
  }
}

export const validateProductGraph = (graph: ProductGraph): ValidationResult =>
  buildResult([
    ...findBrokenReferences(graph),
    ...findDuplicateStoryTriples(graph),
    ...evaluateStatusAwareRules(graph)
  ])

export const validateFindings = (findings: readonly ValidationFinding[]): ValidationResult => buildResult(findings)

export class ValidationService extends Effect.Service<ValidationService>()(
  "@specable/cli/ValidationService",
  {
    effect: Effect.succeed({
      validate: (graph: ProductGraph) => Effect.succeed(validateProductGraph(graph))
    })
  }
) {}

export const validationResultFromDuplicateId = (
  id: PrimitiveBase.PrimitiveId,
  type: string
): ValidationResult => validateFindings([duplicateIdFinding(id, type)])

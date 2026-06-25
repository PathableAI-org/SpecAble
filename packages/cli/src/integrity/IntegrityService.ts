import { Effect } from "effect"

import type { ProductGraph } from "../graph/ProductGraph.js"
import type { ValidationResult } from "../validation/ValidationFinding.js"

import { evaluateCrossPrimitiveAdvisories } from "./AdvisoryRules.js"
import { findNameIntegrityWarnings } from "./DuplicateDetection.js"
import { emptyIntegrityResult, type IntegrityResult, sortIntegrityFindings } from "./IntegrityFinding.js"
import { findOrphans } from "./OrphanDetection.js"
import { buildStoryTripleSummary } from "./StoryTripleSummary.js"
import { findWorkflowDerivationWarnings } from "./WorkflowDerivation.js"

export const analyzeProductGraphIntegrity = (
  graph: ProductGraph,
  validationResult: ValidationResult
): IntegrityResult => {
  const warnings = sortIntegrityFindings([
    ...findNameIntegrityWarnings(graph),
    ...findOrphans(graph),
    ...findWorkflowDerivationWarnings(graph),
    ...evaluateCrossPrimitiveAdvisories()
  ])

  return {
    duplicateStoryTriples: buildStoryTripleSummary(graph, validationResult.failures),
    summary: {
      warningCount: warnings.length
    },
    warnings
  }
}

export class IntegrityService extends Effect.Service<IntegrityService>()(
  "@specable/cli/IntegrityService",
  {
    effect: Effect.succeed({
      analyze: (graph: ProductGraph, validationResult: ValidationResult) =>
        Effect.succeed(analyzeProductGraphIntegrity(graph, validationResult))
    })
  }
) {}

export const emptyIntegrityAnalysis = (): IntegrityResult => emptyIntegrityResult()

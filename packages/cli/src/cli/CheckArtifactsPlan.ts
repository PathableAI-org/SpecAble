import type { ProductGraph } from "../graph/ProductGraph.js"
import type { IntegrityResult } from "../integrity/IntegrityFinding.js"
import type { ValidationResult } from "../validation/ValidationFinding.js"
import type { CheckOutputMode } from "./render/CheckOutput.js"

import { analyzeProductGraphIntegrity } from "../integrity/IntegrityService.js"
import { generateSummaryMarkdown } from "../summary/SummaryGenerator.js"
import { truncateSummaryPreview } from "../summary/SummaryPreview.js"

export interface CheckArtifactsContext {
  readonly integrity: IntegrityResult | undefined
  readonly summaryMarkdown: string | undefined
  readonly summaryPreview: string | undefined
}

export interface LoadedGraph {
  readonly graph: ProductGraph | undefined
  readonly validation: ValidationResult
}

export const needsIntegrityAnalysis = (
  mode: CheckOutputMode,
  outputDir: string | undefined
): boolean => {
  if (outputDir !== undefined) {
    return true
  }

  return mode === "full" || mode === "integrity-only" || mode === "summary-only"
}

export const needsSummaryMarkdown = (
  mode: CheckOutputMode,
  outputDir: string | undefined
): boolean => outputDir !== undefined || mode === "full" || mode === "summary-only"

export const needsSummaryPreview = (mode: CheckOutputMode): boolean => mode === "full" || mode === "summary-only"

export const buildCheckArtifactsContext = (
  loaded: LoadedGraph,
  mode: CheckOutputMode,
  outputDir: string | undefined
): CheckArtifactsContext => {
  if (loaded.graph === undefined) {
    return {
      integrity: undefined,
      summaryMarkdown: undefined,
      summaryPreview: undefined
    }
  }

  const integrity = needsIntegrityAnalysis(mode, outputDir)
    ? analyzeProductGraphIntegrity(loaded.graph, loaded.validation)
    : undefined

  const summaryMarkdown = needsSummaryMarkdown(mode, outputDir) && integrity !== undefined
    ? generateSummaryMarkdown(loaded.graph, loaded.validation, integrity)
    : undefined

  const summaryPreview = needsSummaryPreview(mode) && summaryMarkdown !== undefined
    ? truncateSummaryPreview(summaryMarkdown)
    : undefined

  return {
    integrity,
    summaryMarkdown,
    summaryPreview
  }
}

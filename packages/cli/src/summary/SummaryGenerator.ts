import type { ProductGraph } from "../graph/ProductGraph.js"
import type { IntegrityResult } from "../integrity/IntegrityFinding.js"
import type { ValidationResult } from "../validation/ValidationFinding.js"

import { buildSection, formatSectionMarkdown, summarySectionTitles } from "./SummarySections.js"

export const generateSummaryMarkdown = (
  graph: ProductGraph,
  validation: ValidationResult,
  integrity: IntegrityResult
): string => {
  const sections = summarySectionTitles().map((title) =>
    formatSectionMarkdown(title, buildSection(title, graph, validation, integrity))
  )

  return sections.join("\n\n")
}

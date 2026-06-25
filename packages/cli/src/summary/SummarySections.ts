import type { Primitive, PrimitiveType } from "@specable/domain"

import type { ProductGraph } from "../graph/ProductGraph.js"
import type { IntegrityResult } from "../integrity/IntegrityFinding.js"
import type { ValidationFinding, ValidationResult } from "../validation/ValidationFinding.js"

import { sortIntegrityFindings } from "../integrity/IntegrityFinding.js"
import { formatStoryMetadataComment, resolveStoryText } from "../story/StoryText.js"
import { sortFindings } from "../validation/ValidationFinding.js"

const SECTION_ORDER = [
  "Active Objectives",
  "Workflows",
  "Actors and Personas",
  "Capabilities",
  "Domain Concepts",
  "Expected Results",
  "Stories",
  "Known Modeling Gaps"
] as const

export type SummarySectionTitle = (typeof SECTION_ORDER)[number]

const appendAll = (lines: string[], items: readonly string[]): void => {
  for (const item of items) {
    lines.push(item)
  }
}

const comparePrimitives = (left: Primitive, right: Primitive): number => {
  const typeOrder = left.type.localeCompare(right.type)

  if (typeOrder !== 0) {
    return typeOrder
  }

  return left.id.localeCompare(right.id)
}

const activePrimitivesOfType = (graph: ProductGraph, type: PrimitiveType): readonly Primitive[] =>
  [...graph.primitives]
    .filter((primitive) => primitive.type === type && primitive.status === "Active")
    .sort(comparePrimitives)

const formatPrimitiveLine = (primitive: Primitive): string => {
  const name = primitive.name.trim().length > 0 ? primitive.name.trim() : primitive.id

  return `- ${name} (\`${primitive.id}\`)`
}

export const buildActiveObjectivesSection = (graph: ProductGraph): readonly string[] => {
  const objectives = activePrimitivesOfType(graph, "Objective")

  if (objectives.length === 0) {
    return ["_No Active objectives._"]
  }

  return objectives.map(formatPrimitiveLine)
}

export const buildWorkflowsSection = (graph: ProductGraph): readonly string[] => {
  const workflows = activePrimitivesOfType(graph, "Workflow")

  if (workflows.length === 0) {
    return ["_No Active workflows._"]
  }

  return workflows.map(formatPrimitiveLine)
}

export const buildActorsAndPersonasSection = (graph: ProductGraph): readonly string[] => {
  const actors = activePrimitivesOfType(graph, "Actor")
  const personas = activePrimitivesOfType(graph, "Persona")
  const lines: string[] = []

  if (actors.length > 0) {
    lines.push("### Actors", "")
    appendAll(lines, actors.map(formatPrimitiveLine))
    lines.push("")
  }

  if (personas.length > 0) {
    lines.push("### Personas", "")
    appendAll(lines, personas.map(formatPrimitiveLine))
  }

  if (lines.length === 0) {
    return ["_No Active actors or personas._"]
  }

  return lines
}

export const buildCapabilitiesSection = (graph: ProductGraph): readonly string[] => {
  const capabilities = activePrimitivesOfType(graph, "Capability")

  if (capabilities.length === 0) {
    return ["_No Active capabilities._"]
  }

  return capabilities.map(formatPrimitiveLine)
}

export const buildDomainConceptsSection = (graph: ProductGraph): readonly string[] => {
  const concepts = activePrimitivesOfType(graph, "DomainConcept")
  const links = activePrimitivesOfType(graph, "CapabilityConceptLink")
  const lines: string[] = []

  if (concepts.length > 0) {
    appendAll(lines, concepts.map(formatPrimitiveLine))
  }

  if (links.length > 0) {
    if (lines.length > 0) {
      lines.push("")
    }

    lines.push("### Capability Concept Links", "")
    appendAll(lines, links.map(formatPrimitiveLine))
  }

  if (lines.length === 0) {
    return ["_No Active domain concepts._"]
  }

  return lines
}

export const buildExpectedResultsSection = (graph: ProductGraph): readonly string[] => {
  const expectedResults = activePrimitivesOfType(graph, "ExpectedResult")

  if (expectedResults.length === 0) {
    return ["_No Active expected results._"]
  }

  return expectedResults.map(formatPrimitiveLine)
}

export const buildStoriesSection = (graph: ProductGraph): readonly string[] => {
  const stories = activePrimitivesOfType(graph, "Story")

  if (stories.length === 0) {
    return ["_No Active stories._"]
  }

  const lines: string[] = []

  for (const story of stories) {
    if (story.type !== "Story") {
      continue
    }

    const resolved = resolveStoryText(graph, story)

    if (resolved === undefined) {
      lines.push(`- \`${story.id}\` _(incomplete links)_`)
      continue
    }

    lines.push(
      formatStoryMetadataComment(story.id, resolved),
      resolved.text,
      ""
    )
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop()
  }

  return lines
}

const formatValidationFinding = (finding: ValidationFinding): string =>
  `- [${finding.severity}] ${finding.primitiveType} \`${finding.primitiveId}\` (${finding.code}) ${finding.field}: ${finding.message}`

const formatIntegrityFinding = (
  finding: IntegrityResult["warnings"][number]
): string => {
  const related = finding.relatedIds === undefined || finding.relatedIds.length === 0
    ? ""
    : ` related=${finding.relatedIds.join(",")}`

  return `- [warning] ${finding.primitiveType} \`${finding.primitiveId}\` (${finding.code}) ${finding.field}: ${finding.message}${related}`
}

export const buildGapsSection = (
  validation: ValidationResult,
  integrity: IntegrityResult
): readonly string[] => {
  const lines: string[] = []

  if (validation.failures.length > 0) {
    lines.push("### Failures", "")
    appendAll(lines, sortFindings(validation.failures).map(formatValidationFinding))
    lines.push("")
  }

  const warnings = [
    ...sortFindings(validation.warnings).map(formatValidationFinding),
    ...sortIntegrityFindings(integrity.warnings).map(formatIntegrityFinding)
  ]

  if (warnings.length > 0) {
    lines.push("### Warnings", "")
    appendAll(lines, warnings)
  }

  if (lines.length === 0) {
    return ["_No known modeling gaps._"]
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop()
  }

  return lines
}

export const summarySectionTitles = (): readonly SummarySectionTitle[] => SECTION_ORDER

export const buildSection = (
  title: SummarySectionTitle,
  graph: ProductGraph,
  validation: ValidationResult,
  integrity: IntegrityResult
): readonly string[] => {
  switch (title) {
    case "Active Objectives":
      return buildActiveObjectivesSection(graph)
    case "Actors and Personas":
      return buildActorsAndPersonasSection(graph)
    case "Capabilities":
      return buildCapabilitiesSection(graph)
    case "Domain Concepts":
      return buildDomainConceptsSection(graph)
    case "Expected Results":
      return buildExpectedResultsSection(graph)
    case "Known Modeling Gaps":
      return buildGapsSection(validation, integrity)
    case "Stories":
      return buildStoriesSection(graph)
    case "Workflows":
      return buildWorkflowsSection(graph)
  }
}

export const formatSectionMarkdown = (
  title: SummarySectionTitle,
  bodyLines: readonly string[]
): string => {
  if (title === "Active Objectives") {
    return ["# Product Primitive Summary", "", `## ${title}`, "", ...bodyLines].join("\n")
  }

  return [`## ${title}`, "", ...bodyLines].join("\n")
}

import type { Effect } from "effect"

import * as Console from "effect/Console"

import type { IntegrityResult } from "../../integrity/IntegrityFinding.js"
import type { ValidationResult } from "../../validation/ValidationFinding.js"

import { formatIntegrityOutput } from "./IntegrityOutput.js"
import { formatValidationOutput } from "./ValidationOutput.js"

export interface CheckOutputInput {
  readonly integrity: IntegrityResult | undefined
  readonly mode: CheckOutputMode
  readonly projectPath: string
  readonly summaryPreview: string | undefined
  readonly validation: ValidationResult
}

export type CheckOutputMode = "full" | "integrity-only" | "summary-only" | "validate-only"

const appendBlock = (blocks: string[], block: string | undefined): void => {
  if (block === undefined || block.length === 0) {
    return
  }

  if (blocks.length > 0) {
    blocks.push("")
  }

  blocks.push(block)
}

export const formatCheckOutput = (input: CheckOutputInput): string => {
  const blocks: string[] = []

  if (input.mode === "full" || input.mode === "validate-only" || input.mode === "integrity-only") {
    appendBlock(blocks, formatValidationOutput(input.projectPath, input.validation))
  }

  if ((input.mode === "full" || input.mode === "integrity-only") && input.integrity !== undefined) {
    appendBlock(blocks, formatIntegrityOutput(input.integrity))
  }

  if ((input.mode === "full" || input.mode === "summary-only") && input.summaryPreview !== undefined) {
    appendBlock(blocks, ["Summary preview:", "", input.summaryPreview].join("\n"))
  }

  return blocks.join("\n")
}

export const renderCheckOutput = (input: CheckOutputInput): Effect.Effect<void> => Console.log(formatCheckOutput(input))

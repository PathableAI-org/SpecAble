/**
 * Shared scenario state for Gherkin acceptance tests.
 */
import type { SpecableRunResult } from "../../integration/helpers/runSpecable.js"

export class SpecAbleWorld {
  checkExamplePath?: string
  checkOutDir?: string
  lastResult?: SpecableRunResult
  tempParentPath?: string
  tempProjectPath?: string
}

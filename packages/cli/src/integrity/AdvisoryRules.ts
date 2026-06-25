import type { IntegrityFinding } from "./IntegrityFinding.js"

/**
 * Per-primitive advisory quality flags (FR-013–FR-026) are emitted as validation
 * warnings in `validation.json`. Integrity advisories here are reserved for
 * cross-primitive heuristics not covered by validation rules.
 */
export const evaluateCrossPrimitiveAdvisories = (): readonly IntegrityFinding[] => []

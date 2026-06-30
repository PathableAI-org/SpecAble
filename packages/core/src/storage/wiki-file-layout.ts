import type { PlatformError } from "@effect/platform/Error"
import type * as FileSystem from "@effect/platform/FileSystem"

import { Schema } from "@effect/schema"
import { Effect } from "effect"
import * as path from "node:path"

import type { CanonicalPrimitiveType } from "./PrimitiveTypes.js"

import { CANONICAL_PRIMITIVE_TYPES } from "./PrimitiveTypes.js"

/**
 * Maps each canonical primitive type to its pluralized kebab-case directory
 * name, matching the naming convention established by `PRIMITIVE_TYPE_FILES`
 * (e.g. `actors.json` → `actors` directory, `capability-concept-links.json` →
 * `capability-concept-links` directory).
 */
export const PRIMITIVE_TYPE_DIRECTORIES: Record<CanonicalPrimitiveType, string> = {
  Actor: "actors",
  Capability: "capabilities",
  CapabilityConceptLink: "capability-concept-links",
  DomainConcept: "domain-concepts",
  ExpectedResult: "expected-results",
  Objective: "objectives",
  Persona: "personas",
  Story: "stories",
  Workflow: "workflows"
}

/**
 * Directory entry for wiki backends — pairs a canonical type with its
 * directory name. Includes all 9 canonical types.
 */
export interface WikiTypeDirectoryEntry {
  readonly directoryName: string
  readonly type: CanonicalPrimitiveType
}

/**
 * Directory entries for all 9 canonical primitive types, used by bootstrap
 * to create all per-type directories.
 */
export const WIKI_TYPE_DIRECTORY_ENTRIES: readonly WikiTypeDirectoryEntry[] = CANONICAL_PRIMITIVE_TYPES.map((type) => ({
  directoryName: PRIMITIVE_TYPE_DIRECTORIES[type],
  type
}))

/**
 * Alpha (create/list/get) directory entries — excludes
 * `CapabilityConceptLink`, which is decode-only.
 */
export const ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES: readonly WikiTypeDirectoryEntry[] = WIKI_TYPE_DIRECTORY_ENTRIES.filter((
  entry
) => entry.type !== "CapabilityConceptLink")

/**
 * Returns the directory name for a given canonical primitive type.
 */
export const directoryForType = (type: CanonicalPrimitiveType): string => PRIMITIVE_TYPE_DIRECTORIES[type]

/**
 * Converts a primitive ID to a file name with the given extension.
 * Example: `"cap-schedule-session-a1b2"` → `"cap-schedule-session-a1b2.md"`
 */
export const idToFilename = (id: string, extension: ".md" | ".org"): string => `${id}${extension}`

/**
 * Recovers a primitive ID from a wiki file name by stripping the extension.
 * Example: `"cap-schedule-session-a1b2.md"` → `"cap-schedule-session-a1b2"`
 */
export const filenameToId = (filename: string): string => filename.replace(/\.(md|org)$/, "")

/**
 * Resolves the full file path for a primitive.
 * Example: `"/project", "capabilities", "cap-schedule-session-a1b2", ".md"`
 * → `"/project/capabilities/cap-schedule-session-a1b2.md"`
 */
export const filePathFor = (
  projectRoot: string,
  directory: string,
  id: string,
  extension: ".md" | ".org"
): string => path.join(projectRoot, directory, idToFilename(id, extension))

/**
 * Scans a type directory for all files matching the given extension and
 * returns their filenames (not full paths). Returns an empty array if the
 * directory does not exist (tolerates missing directories for robustness).
 */
export const scanTypeDirectory = (
  fs: FileSystem.FileSystem,
  projectRoot: string,
  directory: string,
  extension: ".md" | ".org"
): Effect.Effect<readonly string[], PlatformError> => {
  const dirPath = path.join(projectRoot, directory)

  return Effect.flatMap(
    fs.exists(dirPath),
    (exists) =>
      exists
        ? Effect.map(
          fs.readDirectory(dirPath),
          (entries) => entries.filter((entry) => entry.endsWith(extension))
        )
        : Effect.succeed([] as readonly string[])
  )
}

/**
 * Validates that a primitive ID is safe for use as a file name component.
 *
 * Primitive IDs are expected to be filesystem-safe (alphanumeric characters
 * and hyphens). This is a pass-through that validates the ID and returns
 * the original string if valid, or a descriptive error if unsafe characters
 * are detected.
 *
 * The allowed pattern is: one or more segments of lowercase alphanumeric
 * characters separated by single hyphens.
 */
const SAFE_ID_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const sanitizeIdForFile = (id: string): Effect.Effect<string, WikiFileLayoutError> =>
  SAFE_ID_REGEX.test(id)
    ? Effect.succeed(id)
    : Effect.fail(
      new WikiFileLayoutError({
        id,
        message:
          `Primitive ID "${id}" contains characters unsafe for file names. Expected lowercase alphanumeric characters and hyphens only.`
      })
    )

/**
 * Tagged error type for wiki file layout operations.
 * Emitted when an ID cannot be safely mapped to a file name or a required
 * directory is missing.
 */
export class WikiFileLayoutError extends Schema.TaggedError<WikiFileLayoutError>(
  "WikiFileLayoutError"
)(
  "WikiFileLayoutError",
  {
    id: Schema.String.annotations({
      description: "Primitive identifier that caused the error",
      identifier: "WikiFileLayoutId",
      title: "ID"
    }),
    message: Schema.String.annotations({
      description: "Human-readable description of the layout error",
      identifier: "WikiFileLayoutMessage",
      title: "Message"
    })
  }
) {}

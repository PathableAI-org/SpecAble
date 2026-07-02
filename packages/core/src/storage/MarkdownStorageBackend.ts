import type { PlatformError } from "@effect/platform/Error"
import type { Primitive } from "@specable/domain"

import * as FileSystem from "@effect/platform/FileSystem"
import { Effect, Layer } from "effect"
import * as jsYaml from "js-yaml"
import { randomUUID } from "node:crypto"
import * as path from "node:path"

import type { PrimitiveSummary } from "../primitive/PrimitiveSummary.js"

import {
  DuplicatePrimitiveIdError,
  PrimitiveNotFoundError,
  PrimitiveValidationError,
  type StorageReadError
} from "../primitive/errors.js"
import { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import { emptyCountsByType, type GraphStoreSummary } from "../project/ProjectDescriptor.js"
import { decodePrimitiveUnknown, summaryFromPrimitive } from "./PrimitiveSchemas.js"
import { CANONICAL_PRIMITIVE_TYPES, type CanonicalPrimitiveType } from "./PrimitiveTypes.js"
import { StorageBackend, type StorageBackendService } from "./StorageBackend.js"
import {
  ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES,
  directoryForType,
  filenameToId,
  filePathFor,
  scanTypeDirectory,
  WIKI_TYPE_DIRECTORY_ENTRIES
} from "./wiki-file-layout.js"

/**
 * Builds a GraphStoreSummary from per-type file counts.
 */
const buildGraphStoreSummary = (counts: GraphStoreSummary["countsByType"]): GraphStoreSummary => {
  const totalPrimitives = CANONICAL_PRIMITIVE_TYPES.reduce((total, type) => total + counts[type], 0)

  return {
    countsByType: counts,
    empty: totalPrimitives === 0,
    totalPrimitives
  }
}

/**
 * Encodes a Primitive to Markdown frontmatter format.
 *
 * Output format:
 * ---
 * <YAML-serialized primitive fields>
 * ---
 * <description body prose>
 */
const encodeToMarkdown = (primitive: Primitive): string => {
  const body = typeof primitive.description === "string" && primitive.description.length > 0
    ? primitive.description
    : ""

  const yaml = jsYaml.dump(primitive, { lineWidth: 120, noRefs: true, sortKeys: true })

  return `---\n${yaml}---\n${body}${body ? "\n" : ""}`
}

/**
 * Splits Markdown file content into frontmatter YAML and body prose.
 * Returns an Effect that fails with IncompleteProjectError when the content
 * does not contain valid frontmatter delimiters.
 */
const splitFrontmatter = (
  filePath: string,
  content: string
): Effect.Effect<{ body: string; yaml: string }, PrimitiveValidationError> =>
  Effect.gen(function*() {
    // Find opening "---\n" delimiter
    const openIdx = content.indexOf("---\n")

    if (openIdx !== 0) {
      return yield* Effect.fail(
        new PrimitiveValidationError({
          message: `File does not start with frontmatter delimiter \`---\`: ${filePath}`,
          path: filePath,
          type: "unknown"
        })
      )
    }

    // Find closing delimiter: prefer "\n---"
    const afterOpen = content.slice(3) // skip opening "---\n"
    const closeIdx = afterOpen.indexOf("\n---")

    if (closeIdx === -1) {
      return yield* Effect.fail(
        new PrimitiveValidationError({
          message: `Markdown file missing closing frontmatter delimiter \`---\`: ${filePath}`,
          path: filePath,
          type: "unknown"
        })
      )
    }

    const yaml = afterOpen.slice(0, closeIdx)
    let body = afterOpen.slice(closeIdx + 4) // skip "\n---"

    // Strip leading newline from body
    if (body.startsWith("\n")) {
      body = body.slice(1)
    }

    // Strip trailing newline
    if (body.endsWith("\n")) {
      body = body.slice(0, -1)
    }

    return { body, yaml }
  })

/**
 * Parses YAML frontmatter and decodes it into a Primitive using the
 * canonical schema for the given type.
 */
const decodeMarkdownFile = (
  filePath: string,
  type: CanonicalPrimitiveType,
  content: string
): Effect.Effect<Primitive, PrimitiveValidationError> =>
  Effect.gen(function*() {
    const { body, yaml } = yield* splitFrontmatter(filePath, content)

    const parsed: unknown = yield* Effect.try({
      catch: (cause) =>
        new PrimitiveValidationError({
          message: cause instanceof Error ? cause.message : "Invalid YAML frontmatter",
          path: filePath,
          type
        }),
      try: () => jsYaml.load(yaml)
    })

    if (typeof parsed !== "object" || parsed === null) {
      return yield* Effect.fail(
        new PrimitiveValidationError({
          message: "YAML frontmatter did not decode to an object",
          path: filePath,
          type
        })
      )
    }

    // Preserve body prose as the description when present, overriding any
    // description that may be embedded in the YAML frontmatter. This ensures
    // manual edits to the body survive round-trip (US4 — T049).
    const raw = parsed as Record<string, unknown>
    if (body.length > 0) {
      raw.description = body
    } else if (raw.description === undefined) {
      raw.description = ""
    }

    // js-yaml may preserve BrandedString values as plain strings from the
    // serialized form; decodePrimitiveUnknown handles the schema validation
    return yield* decodePrimitiveUnknown(type, filePath, raw)
  })

/**
 * Reads a Markdown wiki file from disk and decodes its frontmatter into a
 * Primitive.
 */
const readMarkdownFile = (
  fs: FileSystem.FileSystem,
  filePath: string,
  type: CanonicalPrimitiveType
): Effect.Effect<Primitive, StorageReadError> =>
  Effect.gen(function*() {
    const content = yield* fs.readFileString(filePath)

    return yield* decodeMarkdownFile(filePath, type, content)
  })

/**
 * Scans a single type directory for all `.md` wiki files and decodes them
 * into PrimitiveSummary entries.
 */
const summariesForType = (
  fs: FileSystem.FileSystem,
  projectRoot: string,
  type: CanonicalPrimitiveType
): Effect.Effect<readonly PrimitiveSummary[], StorageReadError> =>
  Effect.gen(function*() {
    const dir = directoryForType(type)
    const filenames = yield* scanTypeDirectory(fs, projectRoot, dir, ".md")
    const summaries: PrimitiveSummary[] = []

    for (const filename of filenames) {
      const filePath = path.join(projectRoot, dir, filename)
      const primitive = yield* readMarkdownFile(fs, filePath, type)
      summaries.push(summaryFromPrimitive(primitive))
    }

    return summaries
  })

/**
 * Checks whether a primitive ID already exists as a `.md` file in any of
 * the wiki type directories.
 */
const primitiveIdExists = (
  fs: FileSystem.FileSystem,
  projectRoot: string,
  id: string
): Effect.Effect<boolean, PlatformError> =>
  Effect.gen(function*() {
    for (const { directoryName } of WIKI_TYPE_DIRECTORY_ENTRIES) {
      const filenames = yield* scanTypeDirectory(fs, projectRoot, directoryName, ".md")

      if (filenames.some((f) => filenameToId(f) === id)) {
        return true
      }
    }

    return false
  })

export const makeMarkdownStorageBackend = Effect.gen(function*() {
  const fs = yield* FileSystem.FileSystem

  const createTypeDirectories = (
    projectRoot: string
  ): Effect.Effect<void, PlatformError> =>
    Effect.forEach(
      WIKI_TYPE_DIRECTORY_ENTRIES,
      (entry) => {
        const dirPath = path.join(projectRoot, entry.directoryName)

        return fs.makeDirectory(dirPath, { recursive: true })
      },
      { discard: true }
    )

  const writeFileAtomically = (filePath: string, content: string): Effect.Effect<void, PlatformError> =>
    Effect.gen(function*() {
      const tempPath = `${filePath}.${randomUUID()}.tmp`

      yield* fs.writeFileString(tempPath, content)
      yield* fs.rename(tempPath, filePath)
    })

  const bootstrap: StorageBackendService["bootstrap"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "md") {
        return yield* Effect.fail(
          new StorageBootstrapError({
            message: `Markdown backend cannot bootstrap storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      yield* createTypeDirectories(projectRoot).pipe(
        Effect.mapError(
          (cause) =>
            new StorageBootstrapError({
              message: `Failed to create wiki type directories: ${String(cause)}`,
              path: projectRoot
            })
        )
      )
    })

  const create: StorageBackendService["create"] = (projectRoot, config, primitive) =>
    Effect.gen(function*() {
      if (config.storage.type !== "md") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Markdown backend cannot create in storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const duplicate = yield* primitiveIdExists(fs, projectRoot, primitive.id).pipe(
        Effect.mapError(
          (cause) =>
            new IncompleteProjectError({
              message: `Failed to check for duplicate primitive ID: ${String(cause)}`,
              path: projectRoot
            })
        )
      )

      if (duplicate) {
        return yield* Effect.fail(
          new DuplicatePrimitiveIdError({
            id: primitive.id,
            path: projectRoot
          })
        )
      }

      const dir = directoryForType(primitive.type)
      const filePath = filePathFor(projectRoot, dir, primitive.id, ".md")
      const content = encodeToMarkdown(primitive)

      yield* writeFileAtomically(filePath, content)
    })

  const get: StorageBackendService["get"] = (projectRoot, config, id) =>
    Effect.gen(function*() {
      if (config.storage.type !== "md") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Markdown backend cannot get from storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      for (const { directoryName, type } of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const filenames = yield* scanTypeDirectory(fs, projectRoot, directoryName, ".md")

        for (const filename of filenames) {
          if (filenameToId(filename) !== id) {
            continue
          }

          const filePath = path.join(projectRoot, directoryName, filename)

          return yield* readMarkdownFile(fs, filePath, type)
        }
      }

      return yield* Effect.fail(
        new PrimitiveNotFoundError({
          id,
          path: projectRoot
        })
      )
    })

  const list: StorageBackendService["list"] = (projectRoot, config, filter) =>
    Effect.gen(function*() {
      if (config.storage.type !== "md") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Markdown backend cannot list storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const entries = filter?.type === undefined
        ? ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES
        : ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES.filter(({ type }) => type === filter.type)

      const summaries: PrimitiveSummary[] = []

      for (const { type } of entries) {
        const typeSummaries = yield* summariesForType(fs, projectRoot, type)

        for (const summary of typeSummaries) {
          summaries.push(summary)
        }
      }

      return summaries
    })

  const describe: StorageBackendService["describe"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "md") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Markdown backend cannot describe storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const counts = { ...emptyCountsByType() }

      for (const { directoryName, type } of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const filenames = yield* scanTypeDirectory(fs, projectRoot, directoryName, ".md")

        counts[type] = filenames.length
      }

      return buildGraphStoreSummary(counts)
    })

  return { bootstrap, create, describe, get, list } satisfies StorageBackendService
})

export const MarkdownStorageBackendLive = Layer.effect(StorageBackend, makeMarkdownStorageBackend)

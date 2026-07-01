import type { PlatformError } from "@effect/platform/Error"
import type { Primitive } from "@specable/domain"

import * as FileSystem from "@effect/platform/FileSystem"
import { Effect, Layer } from "effect"
import { randomUUID } from "node:crypto"
import * as path from "node:path"

import type { PrimitiveValidationError } from "../primitive/errors.js"
import type { PrimitiveSummary } from "../primitive/PrimitiveSummary.js"
import type { CanonicalPrimitiveType } from "./PrimitiveTypes.js"
import type { StorageBackendService } from "./StorageBackend.js"

import { DuplicatePrimitiveIdError, PrimitiveNotFoundError } from "../primitive/errors.js"
import { IncompleteProjectError, StorageBootstrapError } from "../project/errors.js"
import { emptyCountsByType, type GraphStoreSummary } from "../project/ProjectDescriptor.js"
import { decodePrimitiveUnknown, summaryFromPrimitive } from "./PrimitiveSchemas.js"
import { StorageBackend } from "./StorageBackend.js"
import {
  ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES,
  directoryForType,
  filePathFor,
  scanTypeDirectory,
  WIKI_TYPE_DIRECTORY_ENTRIES
} from "./wiki-file-layout.js"

export const makeOrgStorageBackend = Effect.gen(function*() {
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

  const buildGraphStoreSummary = (counts: GraphStoreSummary["countsByType"]): GraphStoreSummary => {
    const totalPrimitives = WIKI_TYPE_DIRECTORY_ENTRIES.reduce((total, { type }) => total + counts[type], 0)

    return {
      countsByType: counts,
      empty: totalPrimitives === 0,
      totalPrimitives
    }
  }

  const encodeToOrg = (primitive: Primitive): string => {
    const lines: string[] = [":PROPERTIES:"]

    for (const [key, value] of Object.entries(primitive)) {
      if (value === undefined || value === null) {
        continue
      }

      let strVal: string
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        strVal = String(value)
      } else {
        strVal = JSON.stringify(value)
      }

      lines.push(`:${key}: ${strVal}`)
    }

    lines.push(":END:")

    const body = typeof primitive.description === "string" && primitive.description.length > 0
      ? primitive.description
      : ""

    if (body) {
      lines.push("", body, "")
    } else {
      lines.push("")
    }

    return lines.join("\n")
  }

  const decodeOrgFile = (
    filePath: string,
    type: CanonicalPrimitiveType,
    content: string
  ): Effect.Effect<Primitive, IncompleteProjectError | PrimitiveValidationError> =>
    Effect.gen(function*() {
      const lines = content.split("\n")

      // Find :PROPERTIES: line (skip leading blank lines)
      let propsStart = -1

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!

        if (line.trim() === ":PROPERTIES:") {
          propsStart = i
          break
        }
      }

      if (propsStart === -1) {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Missing :PROPERTIES: line in Org file: ${path.basename(filePath)}`,
            path: filePath
          })
        )
      }

      // Find :END: line
      let endLine = -1

      for (let i = propsStart + 1; i < lines.length; i++) {
        const line = lines[i]!

        if (line.trim() === ":END:") {
          endLine = i
          break
        }
      }

      if (endLine === -1) {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Missing :END: line in Org file: ${path.basename(filePath)}`,
            path: filePath
          })
        )
      }

      // Parse property drawer lines
      const parsed: Record<string, unknown> = {}
      const propertyLineRegex = /^:([^:]+):\s*(.*)$/

      for (let i = propsStart + 1; i < endLine; i++) {
        const line = lines[i]!

        if (line.trim().length === 0) {
          continue
        }

        const match = propertyLineRegex.exec(line)

        if (!match) {
          continue
        }

        const key = match[1]!

        if (key.length === 0) {
          continue
        }

        let value: unknown = match[2] ?? ""

        // Try to parse JSON values (objects and arrays only)
        if (typeof value === "string" && value.length > 0) {
          try {
            const parsedJson: unknown = JSON.parse(value)

            if (typeof parsedJson === "object" && parsedJson !== null) {
              value = parsedJson
            }
          } catch {
            // Keep as string
          }
        }

        parsed[key] = value
      }

      // Read body text after :END: as the description
      // Preserve content whitespace; only strip framing empty lines
      let body = ""

      for (let i = endLine + 1; i < lines.length; i++) {
        if (i === endLine + 1) {
          body = lines[i]!
        } else {
          body = `${body}\n${lines[i]!}`
        }
      }

      // Strip leading empty line(s) without trimming content
      while (body.startsWith("\n")) {
        body = body.slice(1)
      }

      // Strip trailing empty line(s) without trimming content
      while (body.endsWith("\n")) {
        body = body.slice(0, -1)
      }

      if (body.length > 0) {
        parsed.description = body
      }

      return yield* decodePrimitiveUnknown(type, filePath, parsed)
    })

  const bootstrap: StorageBackendService["bootstrap"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "org") {
        return yield* Effect.fail(
          new StorageBootstrapError({
            message: `Org backend cannot bootstrap storage type "${config.storage.type}"`,
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
      if (config.storage.type !== "org") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Org backend cannot create in storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const id = primitive.id

      // Duplicate ID check: scan all directories for .org file matching this ID
      for (const entry of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const candidatePath = filePathFor(projectRoot, entry.directoryName, id, ".org")
        const exists = yield* fs.exists(candidatePath)

        if (exists) {
          return yield* Effect.fail(
            new DuplicatePrimitiveIdError({
              id,
              path: projectRoot
            })
          )
        }
      }

      const content = encodeToOrg(primitive)
      const dir = directoryForType(primitive.type)
      const filePath = filePathFor(projectRoot, dir, id, ".org")

      yield* writeFileAtomically(filePath, content)
    })

  const get: StorageBackendService["get"] = (projectRoot, config, id) =>
    Effect.gen(function*() {
      if (config.storage.type !== "org") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Org backend cannot get from storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      for (const entry of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const filePath = filePathFor(projectRoot, entry.directoryName, id, ".org")
        const exists = yield* fs.exists(filePath)

        if (!exists) {
          continue
        }

        const content = yield* fs.readFileString(filePath)

        return yield* decodeOrgFile(filePath, entry.type, content)
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
      if (config.storage.type !== "org") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Org backend cannot list storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const directories = filter?.type === undefined
        ? ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES
        : ALPHA_WIKI_TYPE_DIRECTORY_ENTRIES.filter(({ type }) => type === filter.type)

      const summaries: PrimitiveSummary[] = []

      for (const entry of directories) {
        const filenames = yield* scanTypeDirectory(fs, projectRoot, entry.directoryName, ".org")

        for (const filename of filenames) {
          const filePath = path.join(projectRoot, entry.directoryName, filename)
          const content = yield* fs.readFileString(filePath)
          const primitive = yield* decodeOrgFile(filePath, entry.type, content)

          summaries.push(summaryFromPrimitive(primitive))
        }
      }

      return summaries
    })

  const describe: StorageBackendService["describe"] = (projectRoot, config) =>
    Effect.gen(function*() {
      if (config.storage.type !== "org") {
        return yield* Effect.fail(
          new IncompleteProjectError({
            message: `Org backend cannot describe storage type "${config.storage.type}"`,
            path: projectRoot
          })
        )
      }

      const counts = { ...emptyCountsByType() }

      for (const entry of WIKI_TYPE_DIRECTORY_ENTRIES) {
        const filenames = yield* scanTypeDirectory(fs, projectRoot, entry.directoryName, ".org")

        counts[entry.type] = filenames.length
      }

      return buildGraphStoreSummary(counts)
    })

  return { bootstrap, create, describe, get, list } satisfies StorageBackendService
})

export const OrgStorageBackendLive = Layer.effect(StorageBackend, makeOrgStorageBackend)

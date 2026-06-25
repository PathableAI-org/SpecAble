import type { PlatformError } from "@effect/platform/Error"
import type { Primitive } from "@specable/domain"
import type { FixtureDecodeError } from "@specable/domain/errors.js"

import * as FileSystem from "@effect/platform/FileSystem"
import { Effect } from "effect"
import * as path from "node:path"

import { type DuplicateIdError, GraphProjectNotFoundError } from "../errors.js"
import { FIXTURE_FILES, GRAPH_METADATA_FILE, GraphMetadataSchema } from "./FixtureFiles.js"
import { decodeJsonContent } from "./JsonDecode.js"
import { buildGraphIndex, type GraphMetadata, type ProductGraph } from "./ProductGraph.js"

const assertProjectDirectory = (
  fs: FileSystem.FileSystem,
  projectPath: string
): Effect.Effect<void, GraphProjectNotFoundError | PlatformError> =>
  Effect.gen(function*() {
    const exists = yield* fs.exists(projectPath)

    if (!exists) {
      return yield* Effect.fail(new GraphProjectNotFoundError({ path: projectPath }))
    }

    const info = yield* fs.stat(projectPath)

    if (info.type !== "Directory") {
      return yield* Effect.fail(new GraphProjectNotFoundError({ path: projectPath }))
    }
  })

const loadOptionalMetadata = (
  fs: FileSystem.FileSystem,
  projectPath: string
): Effect.Effect<GraphMetadata | null, FixtureDecodeError | PlatformError> =>
  Effect.gen(function*() {
    const metadataPath = path.join(projectPath, GRAPH_METADATA_FILE)
    const exists = yield* fs.exists(metadataPath)

    if (!exists) {
      return null
    }

    const content = yield* fs.readFileString(metadataPath)
    const decoded = yield* decodeJsonContent(metadataPath, GraphMetadataSchema, content)

    return {
      schemaVersion: decoded.schemaVersion,
      ...(decoded.name !== undefined ? { name: decoded.name } : {}),
      ...(decoded.description !== undefined ? { description: decoded.description } : {})
    }
  })

export const loadProductGraph = (
  fs: FileSystem.FileSystem,
  projectPath: string
): Effect.Effect<
  ProductGraph,
  DuplicateIdError | FixtureDecodeError | GraphProjectNotFoundError | PlatformError
> =>
  Effect.gen(function*() {
    yield* assertProjectDirectory(fs, projectPath)

    const metadata = yield* loadOptionalMetadata(fs, projectPath)
    const primitives: Primitive[] = []

    for (const fixture of FIXTURE_FILES) {
      const filePath = path.join(projectPath, fixture.fileName)
      const exists = yield* fs.exists(filePath)

      if (!exists) {
        continue
      }

      const content = yield* fs.readFileString(filePath)
      const decoded = yield* decodeJsonContent(filePath, fixture.schema, content)

      for (const primitive of decoded.primitives) {
        primitives.push(primitive)
      }
    }

    const index = yield* buildGraphIndex(primitives)

    return {
      index,
      metadata,
      primitives,
      projectPath
    }
  })

export class GraphLoader extends Effect.Service<GraphLoader>()("@specable/cli/GraphLoader", {
  accessors: true,
  effect: Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem

    return {
      load: (projectPath: string) => loadProductGraph(fs, projectPath)
    }
  })
}) {}

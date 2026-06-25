import type { PlatformError } from "@effect/platform/Error"
import type { FixtureDecodeError } from "@specable/domain/errors.js"

import { Effect } from "effect"

import type { DuplicateIdError, GraphProjectNotFoundError } from "../errors.js"
import type { ProductGraph } from "./ProductGraph.js"

import { GraphLoader } from "./GraphLoader.js"

export type GraphRepositoryError =
  | DuplicateIdError
  | FixtureDecodeError
  | GraphProjectNotFoundError
  | PlatformError

export type GraphRepositoryLoad = (
  projectPath: string
) => Effect.Effect<ProductGraph, GraphRepositoryError>

export class GraphRepository extends Effect.Service<GraphRepository>()("@specable/cli/GraphRepository", {
  dependencies: [GraphLoader.Default],
  effect: Effect.gen(function*() {
    const loader = yield* GraphLoader

    return {
      load: (projectPath: string) => loader.load(projectPath)
    }
  })
}) {}

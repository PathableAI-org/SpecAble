import { NodeFileSystem } from "@effect/platform-node"
import { layers, ProjectRootService } from "@specable/core"
import { Layer } from "effect"

import { GraphLoader } from "../graph/GraphLoader.js"
import { GraphRepository } from "../graph/GraphRepository.js"

const { JsonStorageBackendLive, SqliteStorageBackendLive } = layers

export const FileSystemLive = NodeFileSystem.layer

const GraphLoaderLive = GraphLoader.Default.pipe(Layer.provide(FileSystemLive))

export const GraphRepositoryLive = GraphRepository.Default.pipe(
  Layer.provide(GraphLoaderLive),
  Layer.provide(FileSystemLive)
)

export const GraphServicesLive = Layer.mergeAll(FileSystemLive, GraphRepositoryLive)

export const projectRootLiveLayer = (storage: "json" | "sqlite") =>
  ProjectRootService.ProjectRootService.Default.pipe(
    Layer.provide(storage === "json" ? JsonStorageBackendLive : SqliteStorageBackendLive),
    Layer.provide(FileSystemLive)
  )

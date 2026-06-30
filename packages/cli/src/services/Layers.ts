import { NodeFileSystem } from "@effect/platform-node"
import { layers, PrimitiveService, ProjectRootService } from "@specable/core"
import { Layer } from "effect"

import { GraphLoader } from "../graph/GraphLoader.js"
import { GraphRepository } from "../graph/GraphRepository.js"

const { JsonStorageBackendLive, RoutedStorageBackendLive, SqliteStorageBackendLive } = layers

export const FileSystemLive = NodeFileSystem.layer

const GraphLoaderLive = GraphLoader.Default.pipe(Layer.provide(FileSystemLive))

export const GraphRepositoryLive = GraphRepository.Default.pipe(
  Layer.provide(GraphLoaderLive),
  Layer.provide(FileSystemLive)
)

export const GraphServicesLive = Layer.mergeAll(FileSystemLive, GraphRepositoryLive)

export const routedStorageBackendLiveLayer = RoutedStorageBackendLive.pipe(Layer.provide(FileSystemLive))

export const primitiveServiceLiveLayer = PrimitiveService.PrimitiveService.Default.pipe(
  Layer.provide(routedStorageBackendLiveLayer),
  Layer.provide(FileSystemLive)
)

export const projectRootLiveLayer = (storage: "json" | "md" | "org" | "sqlite") =>
  ProjectRootService.ProjectRootService.Default.pipe(
    Layer.provide(storage === "json" ? JsonStorageBackendLive : SqliteStorageBackendLive),
    Layer.provide(FileSystemLive)
  )

export const projectRootInspectLiveLayer = ProjectRootService.ProjectRootService.Default.pipe(
  Layer.provide(RoutedStorageBackendLive),
  Layer.provide(FileSystemLive)
)

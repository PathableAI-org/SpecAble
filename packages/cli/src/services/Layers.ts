import { NodeFileSystem } from "@effect/platform-node"
import { layers, PrimitiveService, ProjectRootService } from "@specable/core"
import { Layer } from "effect"

import { GraphLoader } from "../graph/GraphLoader.js"
import { GraphRepository } from "../graph/GraphRepository.js"

const {
  JsonStorageBackendLive,
  MarkdownStorageBackendLive,
  OrgStorageBackendLive,
  RoutedStorageBackendLive,
  SqliteStorageBackendLive
} = layers

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

const storageBackendForType = (storage: "json" | "md" | "org" | "sqlite") => {
  switch (storage) {
    case "json":
      return JsonStorageBackendLive
    case "md":
      return MarkdownStorageBackendLive
    case "org":
      return OrgStorageBackendLive
    case "sqlite":
      return SqliteStorageBackendLive
  }
}

export const projectRootLiveLayer = (storage: "json" | "md" | "org" | "sqlite") =>
  ProjectRootService.ProjectRootService.Default.pipe(
    Layer.provide(storageBackendForType(storage)),
    Layer.provide(FileSystemLive)
  )

export const projectRootInspectLiveLayer = ProjectRootService.ProjectRootService.Default.pipe(
  Layer.provide(RoutedStorageBackendLive),
  Layer.provide(FileSystemLive)
)

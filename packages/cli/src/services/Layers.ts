import { NodeFileSystem } from "@effect/platform-node"
import { Layer } from "effect"

import { GraphLoader } from "../graph/GraphLoader.js"
import { GraphRepository } from "../graph/GraphRepository.js"

export const FileSystemLive = NodeFileSystem.layer

const GraphLoaderLive = GraphLoader.Default.pipe(Layer.provide(FileSystemLive))

export const GraphRepositoryLive = GraphRepository.Default.pipe(
  Layer.provide(GraphLoaderLive),
  Layer.provide(FileSystemLive)
)

export const GraphServicesLive = Layer.mergeAll(FileSystemLive, GraphRepositoryLive)

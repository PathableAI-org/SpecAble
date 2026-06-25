import { NodeFileSystem } from "@effect/platform-node"
import { Layer } from "effect"

import { GraphLoader } from "../graph/GraphLoader.js"

export const FileSystemLive = NodeFileSystem.layer

export const GraphLoaderLive = GraphLoader.Default.pipe(Layer.provide(FileSystemLive))

export const GraphServicesLive = Layer.mergeAll(FileSystemLive, GraphLoaderLive)

#!/usr/bin/env node

import { Command } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"

import { handleCheckCommandError } from "./cli/CheckCommand.js"
import { handleInitCommandError, resolveInitCommandExit } from "./cli/InitCommand.js"
import { handlePrimitiveCreateCommandError, resolvePrimitiveCreateCommandExit } from "./cli/PrimitiveCreateCommand.js"
import { handleProjectShowCommandError, resolveProjectShowCommandExit } from "./cli/ProjectShowCommand.js"
import { rootCommand } from "./cli/RootCommand.js"
import { GraphRepositoryLive, primitiveServiceLiveLayer } from "./services/Layers.js"

const MainLayer = Layer.mergeAll(GraphRepositoryLive, primitiveServiceLiveLayer, NodeContext.layer)

const handleCommandError = (error: unknown): Effect.Effect<void> => {
  if (resolvePrimitiveCreateCommandExit(error) !== undefined) {
    return handlePrimitiveCreateCommandError(error)
  }

  if (resolveProjectShowCommandExit(error) !== undefined) {
    return handleProjectShowCommandError(error)
  }

  if (resolveInitCommandExit(error) !== undefined) {
    return handleInitCommandError(error)
  }

  return handleCheckCommandError(error)
}

const program = rootCommand.pipe(
  Command.run({
    name: "specable",
    version: "0.0.0"
  })
)

program(process.argv).pipe(
  Effect.catchAll(handleCommandError),
  Effect.provide(MainLayer),
  NodeRuntime.runMain
)

#!/usr/bin/env node

import { Command } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"

import { handleCheckCommandError } from "./cli/CheckCommand.js"
import { handleInitCommandError, resolveInitCommandExit } from "./cli/InitCommand.js"
import { rootCommand } from "./cli/RootCommand.js"
import { GraphRepositoryLive } from "./services/Layers.js"

const MainLayer = Layer.merge(GraphRepositoryLive, NodeContext.layer)

const handleCommandError = (error: unknown): Effect.Effect<void> => {
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

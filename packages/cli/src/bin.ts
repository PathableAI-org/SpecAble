#!/usr/bin/env node

import { Command } from "@effect/cli"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"

import { finalizeCliExit } from "./cli/CliExit.js"
import { rootCommand } from "./cli/RootCommand.js"
import { GraphRepositoryLive } from "./services/Layers.js"

const MainLayer = Layer.merge(GraphRepositoryLive, NodeContext.layer)

const program = rootCommand.pipe(
  Command.run({
    name: "specable",
    version: "0.0.0"
  })
)

program(process.argv).pipe(
  Effect.provide(MainLayer),
  finalizeCliExit,
  NodeRuntime.runMain
)

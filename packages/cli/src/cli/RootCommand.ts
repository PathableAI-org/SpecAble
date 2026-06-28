import { Command } from "@effect/cli"

import { checkCommand } from "./CheckCommand.js"
import { initCommand } from "./InitCommand.js"
import { primitiveCreateCommand } from "./PrimitiveCreateCommand.js"
import { primitiveListCommand } from "./PrimitiveListCommand.js"
import { projectShowCommand } from "./ProjectShowCommand.js"

const projectCommand = Command.make("project").pipe(
  Command.withSubcommands([projectShowCommand]),
  Command.withDescription("Project root commands")
)

const primitiveCommand = Command.make("primitive").pipe(
  Command.withSubcommands([primitiveCreateCommand, primitiveListCommand]),
  Command.withDescription("Product primitive commands")
)

export const rootCommand = Command.make("specable").pipe(
  Command.withSubcommands([checkCommand, initCommand, primitiveCommand, projectCommand])
)

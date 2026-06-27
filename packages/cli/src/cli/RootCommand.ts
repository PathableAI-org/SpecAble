import { Command } from "@effect/cli"

import { checkCommand } from "./CheckCommand.js"
import { initCommand } from "./InitCommand.js"
import { projectShowCommand } from "./ProjectShowCommand.js"

const projectCommand = Command.make("project").pipe(
  Command.withSubcommands([projectShowCommand]),
  Command.withDescription("Project root commands")
)

export const rootCommand = Command.make("specable").pipe(
  Command.withSubcommands([checkCommand, initCommand, projectCommand])
)

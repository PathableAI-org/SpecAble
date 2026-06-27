import { Command } from "@effect/cli"

import { checkCommand } from "./CheckCommand.js"
import { initCommand } from "./InitCommand.js"

export const rootCommand = Command.make("specable").pipe(
  Command.withSubcommands([checkCommand, initCommand])
)

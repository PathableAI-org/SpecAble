import { Command } from "@effect/cli"

import { checkCommand } from "./CheckCommand.js"

export const rootCommand = Command.make("specable").pipe(Command.withSubcommands([checkCommand]))

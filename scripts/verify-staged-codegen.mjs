#!/usr/bin/env node
import { execSync } from "node:child_process"

const staged = execSync("git diff --cached --name-only --diff-filter=ACMR", {
  encoding: "utf8"
})
  .split("\n")
  .filter(Boolean)

const cliSourceChanged = staged.some(
  (path) => path.startsWith("packages/cli/src/") && path !== "packages/cli/src/index.ts"
)

if (!cliSourceChanged) {
  process.exit(0)
}

execSync("pnpm codegen", { stdio: "inherit" })

const indexStatus = execSync("git status --porcelain packages/cli/src/index.ts", {
  encoding: "utf8"
}).trim()

if (indexStatus.length > 0) {
  console.error(
    "packages/cli/src/index.ts is out of date. Run `pnpm codegen`, stage the result, and commit again."
  )
  process.exit(1)
}

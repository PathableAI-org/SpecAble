#!/usr/bin/env node
import { execSync } from "node:child_process"

const staged = execSync("git diff --cached --name-only --diff-filter=ACMR", {
  encoding: "utf8"
})
  .split("\n")
  .filter(Boolean)

const packages = [
  { name: "domain", indexPath: "packages/domain/src/index.ts" },
  { name: "cli", indexPath: "packages/cli/src/index.ts" }
]

const sourceChanged = packages.some(({ name, indexPath }) =>
  staged.some((path) => path.startsWith(`packages/${name}/src/`) && path !== indexPath)
)

if (!sourceChanged) {
  process.exit(0)
}

execSync("pnpm codegen", { stdio: "inherit" })

for (const { indexPath } of packages) {
  const unstagedDiff = execSync(`git diff ${indexPath}`, {
    encoding: "utf8"
  }).trim()

  if (unstagedDiff.length > 0) {
    console.error(
      `${indexPath} is out of date. Run \`pnpm codegen\`, stage the result, and commit again.`
    )
    process.exit(1)
  }
}

#!/usr/bin/env node
import { execSync } from "node:child_process"

const packages = [
  { indexPath: "packages/domain/src/index.ts" },
  { indexPath: "packages/core/src/index.ts" },
  { indexPath: "packages/cli/src/index.ts" }
]

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

import { globSync } from "glob"
import * as Fs from "node:fs"
import * as path from "node:path"

const dirs = [".", ...globSync("packages/*", { onlyDirectories: true })]

for (const pkg of dirs) {
  for (const file of [".tsbuildinfo", "build", "dist", "coverage"]) {
    Fs.rmSync(path.join(pkg, file), { recursive: true, force: true })
  }
}

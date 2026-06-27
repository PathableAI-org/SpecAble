import * as path from "node:path"
import { fileURLToPath } from "node:url"

import { materializeSqliteFromSchema } from "./prepareSqliteFixture.js"

const testDir = path.dirname(fileURLToPath(import.meta.url))
const examplesDir = path.join(testDir, "../../../examples/project")

const SQLITE_EXAMPLE_ROOTS = [path.join(examplesDir, "sqlite-empty")] as const

const main = async (): Promise<void> => {
  for (const projectRoot of SQLITE_EXAMPLE_ROOTS) {
    const dbPath = await materializeSqliteFromSchema(projectRoot)

    console.log(`Prepared SQLite example: ${dbPath}`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

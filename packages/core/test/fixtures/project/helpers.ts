import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"

import type { ProjectConfig } from "../../../src/project/ProjectConfig.js"

const DEFAULT_PREFIX = "specable-project-"

export const makeTempProjectDir = async (prefix = DEFAULT_PREFIX): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), prefix))

export const removeTempDir = async (dirPath: string): Promise<void> => {
  await fs.rm(dirPath, { force: true, recursive: true })
}

export const writeSpecableJson = async (dirPath: string, config: ProjectConfig): Promise<string> => {
  const filePath = path.join(dirPath, "specable.json")
  await fs.writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8")

  return filePath
}

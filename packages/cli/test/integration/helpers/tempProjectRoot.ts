import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"

const DEFAULT_PREFIX = "specable-cli-integration-"

export const makeEmptyTempDir = (prefix = DEFAULT_PREFIX): Promise<string> => fs.mkdtemp(path.join(os.tmpdir(), prefix))

export const makeTempProjectPath = async (name: string, prefix = DEFAULT_PREFIX): Promise<string> => {
  const parentDir = await makeEmptyTempDir(prefix)

  return path.join(parentDir, name)
}

export const makeNonEmptyTempDir = async (prefix = DEFAULT_PREFIX): Promise<string> => {
  const dirPath = await makeEmptyTempDir(prefix)
  await fs.writeFile(path.join(dirPath, "existing.txt"), "placeholder\n", "utf8")

  return dirPath
}

export const removeTempProjectTree = async (dirPath: string): Promise<void> => {
  await fs.rm(dirPath, { force: true, recursive: true })
}

export const removeTempProjectParent = async (projectPath: string): Promise<void> => {
  await removeTempProjectTree(path.dirname(projectPath))
}

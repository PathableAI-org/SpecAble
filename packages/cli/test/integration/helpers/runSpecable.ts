import { execFile } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

const helpersDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(helpersDir, "../../../../../")
const specableBin = path.join(repoRoot, "packages/cli/bin/specable.js")

export interface SpecableRunResult {
  readonly code: number
  readonly stderr: string
  readonly stdout: string
}

export const getSpecableBinPath = (): string => specableBin

export const assertSpecableBuilt = (): void => {
  if (!fs.existsSync(specableBin)) {
    throw new Error("specable CLI shim missing; run `pnpm build` from the repository root first")
  }
}

export const runSpecable = async (
  args: readonly string[],
  options?: { readonly cwd?: string }
): Promise<SpecableRunResult> => {
  assertSpecableBuilt()

  try {
    const { stderr, stdout } = await execFileAsync(process.execPath, [specableBin, ...args], {
      cwd: options?.cwd,
      env: { ...process.env, FORCE_COLOR: "0" },
      maxBuffer: 10 * 1024 * 1024
    })

    return {
      code: 0,
      stderr: stderr.toString(),
      stdout: stdout.toString()
    }
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "stdout" in error &&
      "stderr" in error
    ) {
      const execError = error as NodeJS.ErrnoException & {
        readonly stderr: Buffer | string
        readonly stdout: Buffer | string
      }
      const exitCode = typeof execError.code === "number" ? execError.code : 1

      return {
        code: exitCode,
        stderr: execError.stderr.toString(),
        stdout: execError.stdout.toString()
      }
    }

    throw error
  }
}

#!/usr/bin/env node
import { accessSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const dir = dirname(fileURLToPath(import.meta.url))
const candidates = [
  join(dir, "..", "build", "esm", "bin.js"),
  join(dir, "..", "dist", "esm", "bin.js")
]

const target = candidates.find((candidate) => {
  try {
    accessSync(candidate)
    return true
  } catch {
    return false
  }
})

if (target === undefined) {
  console.error("specable: run `pnpm build` from the repository root first")
  process.exit(2)
}

await import(pathToFileURL(target).href)

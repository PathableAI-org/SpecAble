import * as Reactivity from "@effect/experimental/Reactivity"
import { make as makeSqliteClient } from "@effect/sql-sqlite-node/SqliteClient"
import { Effect } from "effect"
import * as fs from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"

import { decodeProjectConfig, type ProjectConfig } from "../../../src/project/ProjectConfig.js"
import { PRIMITIVE_TYPE_FILE_ENTRIES } from "../../../src/storage/PrimitiveTypes.js"

const GRAPH_SCHEMA_KEY = "graph-schema"
const GRAPH_SCHEMA_VERSION = "1"

const DEFAULT_PREFIX = "specable-project-"
export const SPECABLE_JSON = "specable.json"

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUuidV4 = (value: string): boolean => UUID_V4_PATTERN.test(value)

export const makeTempProjectDir = async (prefix = DEFAULT_PREFIX): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), prefix))

export const removeTempDir = async (dirPath: string): Promise<void> => {
  await fs.rm(dirPath, { force: true, recursive: true })
}

export const writeSpecableJson = async (dirPath: string, config: ProjectConfig): Promise<string> => {
  const filePath = path.join(dirPath, SPECABLE_JSON)
  await fs.writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`, "utf8")

  return filePath
}

export const readSpecableJson = async (dirPath: string): Promise<ProjectConfig> => {
  const filePath = path.join(dirPath, SPECABLE_JSON)
  const content = await fs.readFile(filePath, "utf8")

  return Effect.runSync(decodeProjectConfig(JSON.parse(content)))
}

export const readPrimitiveFile = async (
  dirPath: string,
  fileName: string
): Promise<{ readonly primitives: readonly unknown[] }> => {
  const content = await fs.readFile(path.join(dirPath, fileName), "utf8")

  return JSON.parse(content) as { readonly primitives: readonly unknown[] }
}

export const assertAllPrimitiveFilesEmpty = async (dirPath: string): Promise<void> => {
  for (const { fileName } of PRIMITIVE_TYPE_FILE_ENTRIES) {
    const file = await readPrimitiveFile(dirPath, fileName)

    if (file.primitives.length !== 0) {
      throw new Error(`Expected empty primitives in ${fileName}`)
    }
  }
}

export const assertSqliteGraphLayout = async (dbPath: string): Promise<void> => {
  await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const sql = yield* makeSqliteClient({ filename: dbPath })

        const schemaRows = yield* sql<{ readonly value: string }>`
          SELECT value FROM schema_meta WHERE key = ${GRAPH_SCHEMA_KEY}
        `

        if (schemaRows.length !== 1 || schemaRows[0]?.value !== GRAPH_SCHEMA_VERSION) {
          return yield* Effect.fail(
            new Error("SQLite schema_meta missing graph-schema version row")
          )
        }

        const countRows = yield* sql<{ readonly count: number }>`
          SELECT COUNT(*) AS count FROM primitives
        `
        const total = Number(countRows[0]?.count ?? 0)

        if (total !== 0) {
          return yield* Effect.fail(new Error(`Expected empty primitives table, found ${total} rows`))
        }
      })
    ).pipe(Effect.provide(Reactivity.layer))
  )
}

export const assertNoJsonPrimitiveFiles = async (dirPath: string): Promise<void> => {
  for (const { fileName } of PRIMITIVE_TYPE_FILE_ENTRIES) {
    const filePath = path.join(dirPath, fileName)

    try {
      await fs.access(filePath)
      throw new Error(`Expected no JSON primitive file at ${fileName}`)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Expected no JSON primitive file")) {
        throw error
      }
    }
  }
}

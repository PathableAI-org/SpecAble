import * as path from "node:path"
import type { UserConfig } from "vitest/config"

const dirname = import.meta.dirname

const alias = (name: string) => {
  const target = process.env.TEST_DIST !== undefined ? "dist/dist/esm" : "src"
  return [
    {
      find: `@specable/${name}/test`,
      replacement: path.join(dirname, "packages", name, "test")
    },
    {
      find: new RegExp(`^@specable/${name}/(.+)$`),
      replacement: path.join(dirname, "packages", name, `${target}/$1`)
    },
    {
      find: `@specable/${name}`,
      replacement: path.join(dirname, "packages", name, target)
    }
  ]
}

// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: UserConfig = {
  esbuild: {
    target: "es2020"
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"]
  },
  resolve: {
    alias: [...alias("cli")]
  },
  test: {
    setupFiles: [path.join(dirname, "setupTests.ts")],
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    include: ["test/**/*.test.ts"]
  }
}

export default config

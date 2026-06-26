import { mergeConfig, type UserConfigExport } from "vitest/config"

import shared from "./vitest.shared.ts"

const config: UserConfigExport = {
  test: {
    include: ["packages/*/test/**/*.test.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.ts"],
      exclude: ["packages/*/src/index.ts", "packages/cli/src/bin.ts"]
    }
  }
}

export default mergeConfig(shared, config)

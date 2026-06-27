import { mergeConfig, type UserConfigExport } from "vitest/config"
import { cucumber } from "@lotun/vitest-cucumber"

import shared from "./vitest.shared.ts"

/**
 * Vitest config for Gherkin acceptance tests (Phase 2).
 *
 * Run: pnpm test:acceptance
 * Filter tags: CUCUMBER_OPTIONS="--tags @smoke" pnpm test:acceptance
 */
const config: UserConfigExport = mergeConfig(shared, {
  plugins: [
    cucumber({
      import: [
        "packages/cli/test/acceptance/step-definitions/**/*.ts",
        "packages/cli/test/acceptance/support/**/*.ts"
      ]
    })
  ],
  test: {
    include: ["packages/cli/test/acceptance/features/**/*.feature"],
    testTimeout: 30_000
  }
})

export default config

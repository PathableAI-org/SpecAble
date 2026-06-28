import { expect } from "@effect/vitest"
import { Cause, Exit, Option } from "effect"

export const expectFailure = <E>(exit: Exit.Exit<unknown, E>, errorType: new(...args: never[]) => E) => {
  expect(Exit.isFailure(exit)).toBe(true)

  if (Exit.isFailure(exit)) {
    const error = Cause.failureOption(exit.cause)
    expect(Option.isSome(error)).toBe(true)

    if (Option.isSome(error)) {
      expect(error.value).toBeInstanceOf(errorType)
    }
  }
}

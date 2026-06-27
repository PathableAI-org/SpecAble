@check @smoke
Feature: v0 check regression

  Legacy fixture directories must work without specable.json.
  See specs/001-product-primitives-v0/quickstart.md

  Scenario: Check bundled generic valid example
    When I run specable check on the bundled generic valid example
    Then the exit code should be 0

  Scenario: Write check artifacts with --out
    When I run specable check with --out on the bundled generic valid example
    Then the exit code should be 0
    And check artifacts should be written

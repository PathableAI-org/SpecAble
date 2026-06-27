@init @sqlite
Feature: Initialize SQLite project root

  Scenario: Explicit SQLite storage
    Given an empty temporary project directory
    When I run specable init with storage "sqlite"
    Then the exit code should be 0
    And stdout should contain "storage: sqlite"
    And specable.json should declare storage type "sqlite"
    And graph.sqlite should exist with zero primitives

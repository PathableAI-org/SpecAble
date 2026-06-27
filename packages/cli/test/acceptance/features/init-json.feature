@init @smoke
Feature: Initialize JSON project root

  Milestone acceptance for default JSON storage init.
  See specs/002-initialize-project-roots/quickstart.md

  Scenario: Default storage is JSON
    Given an empty temporary project directory
    When I run specable init with default storage
    Then the exit code should be 0
    And stdout should contain "storage: json"
    And specable.json should declare storage type "json"
    And nine empty primitive JSON files should exist

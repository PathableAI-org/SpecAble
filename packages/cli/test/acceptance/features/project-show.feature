@inspect @smoke
Feature: Inspect project root

  Scenario: Show empty JSON-backed root
    Given an empty temporary project directory
    When I run specable init with default storage
    And I run specable project show on that root
    Then the exit code should be 0
    And stdout should contain "graph.empty: true"
    And stdout should contain "storage.type: json"

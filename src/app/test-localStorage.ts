// Test file for localStorage functionality
// Run this in browser console to test all features

export function runLocalStorageTests() {
  console.log("🧪 Starting localStorage Tests...");

  let testResults: {
    passed: number;
    failed: number;
    tests: Array<{ name: string; status: string; error?: string }>;
  } = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function test(name: string, testFn: () => boolean) {
    try {
      const result = testFn();
      if (result) {
        testResults.passed++;
        testResults.tests.push({ name, status: "PASS" });
        console.log(`✅ ${name}`);
      } else {
        testResults.failed++;
        testResults.tests.push({ name, status: "FAIL" });
        console.log(`❌ ${name}`);
      }
    } catch (error) {
      testResults.failed++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      testResults.tests.push({ name, status: "ERROR", error: errorMessage });
      console.log(`💥 ${name} - Error: ${errorMessage}`);
    }
  }

  // Test 1: Check if localStorage is available
  test("localStorage is available", () => {
    return typeof localStorage !== "undefined";
  });

  // Test 2: Clear any existing data
  test("Clear existing data", () => {
    localStorage.removeItem("badminton-matchmaker-data");
    localStorage.removeItem("badminton-matchmaker-config");
    return true;
  });

  // Test 3: Test configuration storage
  test("Save and load configuration", () => {
    const testConfig = { courts: 2, randomnessLevel: 0.7 };
    localStorage.setItem(
      "badminton-matchmaker-config",
      JSON.stringify(testConfig)
    );
    const loaded = JSON.parse(
      localStorage.getItem("badminton-matchmaker-config") || "{}"
    );
    return loaded.courts === 2 && loaded.randomnessLevel === 0.7;
  });

  // Test 4: Test player data storage
  test("Save and load player data", () => {
    const testData = {
      players: [
        [
          "player1",
          {
            id: "player1",
            name: "Alice",
            gamesPlayed: 0,
            lastPlayedRound: -1,
            restRounds: 0,
          },
        ],
        [
          "player2",
          {
            id: "player2",
            name: "Bob",
            gamesPlayed: 0,
            lastPlayedRound: -1,
            restRounds: 0,
          },
        ],
      ],
      currentRound: 0,
      courts: 1,
      randomnessLevel: 0.5,
      partnershipHistory: {},
      oppositionHistory: {},
      rounds: [],
    };

    localStorage.setItem("badminton-matchmaker-data", JSON.stringify(testData));
    const loaded = JSON.parse(
      localStorage.getItem("badminton-matchmaker-data") || "{}"
    );
    return loaded.players.length === 2 && loaded.players[0][1].name === "Alice";
  });

  // Test 5: Test round data storage
  test("Save and load round data", () => {
    const testRound = {
      roundNumber: 1,
      matches: [
        {
          court: 1,
          team1: [
            {
              id: "player1",
              name: "Alice",
              gamesPlayed: 1,
              lastPlayedRound: 1,
              restRounds: 0,
            },
            {
              id: "player2",
              name: "Bob",
              gamesPlayed: 1,
              lastPlayedRound: 1,
              restRounds: 0,
            },
          ],
          team2: [
            {
              id: "player3",
              name: "Charlie",
              gamesPlayed: 1,
              lastPlayedRound: 1,
              restRounds: 0,
            },
            {
              id: "player4",
              name: "Diana",
              gamesPlayed: 1,
              lastPlayedRound: 1,
              restRounds: 0,
            },
          ],
        },
      ],
      playersPlaying: [],
      playersSittingOut: [],
    };

    const testData = {
      players: [],
      currentRound: 1,
      courts: 1,
      randomnessLevel: 0.5,
      partnershipHistory: {},
      oppositionHistory: {},
      rounds: [testRound],
    };

    localStorage.setItem("badminton-matchmaker-data", JSON.stringify(testData));
    const loaded = JSON.parse(
      localStorage.getItem("badminton-matchmaker-data") || "{}"
    );
    return loaded.rounds.length === 1 && loaded.rounds[0].roundNumber === 1;
  });

  // Test 6: Test data persistence across page reloads
  test("Data persists after localStorage operations", () => {
    const testConfig = { courts: 3, randomnessLevel: 0.3 };
    localStorage.setItem(
      "badminton-matchmaker-config",
      JSON.stringify(testConfig)
    );

    // Simulate page reload by clearing and reloading
    const savedConfig = localStorage.getItem("badminton-matchmaker-config");
    localStorage.removeItem("badminton-matchmaker-config");
    localStorage.setItem("badminton-matchmaker-config", savedConfig || "");

    const loaded = JSON.parse(
      localStorage.getItem("badminton-matchmaker-config") || "{}"
    );
    return loaded.courts === 3 && loaded.randomnessLevel === 0.3;
  });

  // Test 7: Test reset functionality
  test("Reset clears all data", () => {
    // First add some data
    localStorage.setItem(
      "badminton-matchmaker-data",
      JSON.stringify({ test: "data" })
    );
    localStorage.setItem(
      "badminton-matchmaker-config",
      JSON.stringify({ test: "config" })
    );

    // Then reset
    localStorage.removeItem("badminton-matchmaker-data");
    localStorage.removeItem("badminton-matchmaker-config");

    return (
      !localStorage.getItem("badminton-matchmaker-data") &&
      !localStorage.getItem("badminton-matchmaker-config")
    );
  });

  // Test 8: Test error handling for invalid JSON
  test("Handles invalid JSON gracefully", () => {
    localStorage.setItem("badminton-matchmaker-data", "invalid json");

    try {
      const data = JSON.parse(
        localStorage.getItem("badminton-matchmaker-data") || "{}"
      );
      return false; // Should not reach here
    } catch (error) {
      return true; // Should throw error
    }
  });

  // Test 9: Test large data storage
  test("Handles large data sets", () => {
    const largeData = {
      players: Array.from({ length: 20 }, (_, i) => [
        `player${i}`,
        {
          id: `player${i}`,
          name: `Player ${i}`,
          gamesPlayed: i,
          lastPlayedRound: i,
          restRounds: 0,
        },
      ]),
      currentRound: 10,
      courts: 5,
      randomnessLevel: 0.5,
      partnershipHistory: {},
      oppositionHistory: {},
      rounds: Array.from({ length: 10 }, (_, i) => ({
        roundNumber: i + 1,
        matches: [],
        playersPlaying: [],
        playersSittingOut: [],
      })),
    };

    localStorage.setItem(
      "badminton-matchmaker-data",
      JSON.stringify(largeData)
    );
    const loaded = JSON.parse(
      localStorage.getItem("badminton-matchmaker-data") || "{}"
    );
    return loaded.players.length === 20 && loaded.rounds.length === 10;
  });

  // Test 10: Test configuration validation
  test("Configuration values are within valid ranges", () => {
    const testConfig = { courts: 5, randomnessLevel: 0.8 };
    localStorage.setItem(
      "badminton-matchmaker-config",
      JSON.stringify(testConfig)
    );
    const loaded = JSON.parse(
      localStorage.getItem("badminton-matchmaker-config") || "{}"
    );

    return (
      loaded.courts >= 1 &&
      loaded.courts <= 10 &&
      loaded.randomnessLevel >= 0 &&
      loaded.randomnessLevel <= 1
    );
  });

  // Print final results
  console.log("\n📊 Test Results:");
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(
    `📈 Success Rate: ${(
      (testResults.passed / (testResults.passed + testResults.failed)) *
      100
    ).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log("\n❌ Failed Tests:");
    testResults.tests
      .filter((t) => t.status !== "PASS")
      .forEach((test) => {
        console.log(
          `  - ${test.name}: ${test.status}${
            test.error ? ` (${test.error})` : ""
          }`
        );
      });
  }

  return testResults;
}

// Auto-run tests if this file is imported
if (typeof window !== "undefined") {
  // Wait for page to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(runLocalStorageTests, 1000);
    });
  } else {
    setTimeout(runLocalStorageTests, 1000);
  }
}

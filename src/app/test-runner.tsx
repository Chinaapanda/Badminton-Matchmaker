"use client";

import { runLocalStorageTests } from "./test-localStorage";

export default function TestRunner() {
  const runTests = () => {
    console.clear();
    console.log("🚀 Running localStorage Tests...");
    const results = runLocalStorageTests();

    // Also display results in the UI
    const resultDiv = document.getElementById("test-results");
    if (resultDiv) {
      resultDiv.innerHTML = `
        <h3>Test Results:</h3>
        <p>✅ Passed: ${results.passed}</p>
        <p>❌ Failed: ${results.failed}</p>
        <p>📈 Success Rate: ${(
          (results.passed / (results.passed + results.failed)) *
          100
        ).toFixed(1)}%</p>
        ${
          results.failed > 0
            ? `
          <h4>Failed Tests:</h4>
          <ul>
            ${results.tests
              .filter((t) => t.status !== "PASS")
              .map(
                (test) =>
                  `<li>${test.name}: ${test.status}${
                    test.error ? ` (${test.error})` : ""
                  }</li>`
              )
              .join("")}
          </ul>
        `
            : ""
        }
      `;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/20">
      <h3 className="text-lg font-bold mb-2">🧪 Test Runner</h3>
      <button onClick={runTests} className="btn btn-primary text-sm mb-2">
        Run localStorage Tests
      </button>
      <div id="test-results" className="text-sm"></div>
    </div>
  );
}

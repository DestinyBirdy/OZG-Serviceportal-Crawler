const { sortPages } = require("./report.js"); // Import the sortPages function from report.js
const { test, expect } = require("@jest/globals"); // Import Jest testing functions

// Test: Sorting pages by the number of hits in descending order
test("sortPages", () => {
  // Input: An object with URLs as keys and their respective hit counts as values
  const input = {
    "https://service.muelheim-ruhr.de": 3,
    "https://service.muelheim-ruhr.de/path": 1,
  };

  // Function call: Run sortPages to sort the entries
  const actual = sortPages(input);

  // Expected output: The URLs sorted in descending order based on hit count
  const expected = [
    ["https://service.muelheim-ruhr.de", 3],
    ["https://service.muelheim-ruhr.de/path", 1],
  ];

  // Assertion: Check if the actual output matches the expected sorted array
  expect(actual).toEqual(expected);
});

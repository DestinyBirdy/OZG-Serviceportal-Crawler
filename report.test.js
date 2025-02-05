const { sortPages } = require("./report.js"); // Imports functions from crawler.js
const { test, expect } = require("@jest/globals"); // Imports Jest testing functions

// Test: Normalize URL by removing the protocol
test("sortPages", () => {
  const input = {
    "https://service.muelheim-ruhr.de": 3,
    "https://service.muelheim-ruhr.de/path": 1,
  };
  const actual = sortPages(input);
  const expected = [
    ["https://service.muelheim-ruhr.de", 3],
    ["https://service.muelheim-ruhr.de/path", 1],
  ];
  expect(actual).toEqual(expected);
});

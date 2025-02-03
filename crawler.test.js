const { normalizeURL } = require("./crawler");
const { test, expect } = require("@jest/globals");

test("normalizeURL strip protocol", () => {
  const input = "https://service.muelheim-ruhr.de/test";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/test";
  expect(actual).toEqual(expected);
});

test("normalizeURL strip trailing slash", () => {
  const input = "https://service.muelheim-ruhr.de/Test/";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/Test";
  expect(actual).toEqual(expected);
});

test("normalizeURL capitals", () => {
  const input = "https://SERVIce.muelheim-ruhr.de/Test";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/Test";
  expect(actual).toEqual(expected);
});

test("normalizeURL strip http", () => {
  const input = "http://service.muelheim-ruhr.de/Test";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/Test";
  expect(actual).toEqual(expected);
});

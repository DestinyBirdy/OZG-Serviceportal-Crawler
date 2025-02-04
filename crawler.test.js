const { normalizeURL, getURLFromHTML } = require("./crawler"); // Imports functions from crawler.js
const { test, expect } = require("@jest/globals"); // Imports Jest testing functions

// Test: Normalize URL by removing the protocol
test("normalizeURL strip protocol", () => {
  const input = "https://service.muelheim-ruhr.de/test";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/test";
  expect(actual).toEqual(expected);
});

// Test: Normalize URL by removing the trailing slash
test("normalizeURL strip trailing slash", () => {
  const input = "https://service.muelheim-ruhr.de/Test/";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/Test";
  expect(actual).toEqual(expected);
});

// Test: Normalize URL by converting uppercase letters to lowercase
test("normalizeURL capitals", () => {
  const input = "https://SERVIce.muelheim-ruhr.de/Test";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/Test";
  expect(actual).toEqual(expected);
});

// Test: Normalize URL by removing 'http' protocol
test("normalizeURL strip http", () => {
  const input = "http://service.muelheim-ruhr.de/Test";
  const actual = normalizeURL(input);
  const expected = "service.muelheim-ruhr.de/Test";
  expect(actual).toEqual(expected);
});

// Test: Extract absolute URL from an HTML string
test("getURLsFromHTML absolute", () => {
  const inputHTMLBody = `
    <html>
        <body>
            <a href="https://service.muelheim-ruhr.de/href/">
                Serviceportal Muelheim
            </a>
        </body>
    </html>
    `;
  const inputBaseURL = "https://service.muelheim-ruhr.de/href/";
  const actual = getURLFromHTML(inputHTMLBody, inputBaseURL);
  const expected = ["https://service.muelheim-ruhr.de/href/"];
  expect(actual).toEqual(expected);
});

// Test: Extract relative URL and convert to absolute
test("getURLsFromHTML relative", () => {
  const inputHTMLBody = `
      <html>
          <body>
              <a href="/href/">
                  Serviceportal Muelheim
              </a>
          </body>
      </html>
      `;
  const inputBaseURL = "https://service.muelheim-ruhr.de";
  const actual = getURLFromHTML(inputHTMLBody, inputBaseURL);
  const expected = ["https://service.muelheim-ruhr.de/href/"];
  expect(actual).toEqual(expected);
});

// Test: Extract both relative and absolute URLs from an HTML string
test("getURLsFromHTML relative and absolute", () => {
  const inputHTMLBody = `
        <html>
            <body>
                <a href="/href1/">
                    Serviceportal Muelheim href 1
                </a>
                <a href="https://service.muelheim-ruhr.de/href2/">
                    Serviceportal Muelheim href 2
                </a>
            </body>
        </html>
        `;
  const inputBaseURL = "https://service.muelheim-ruhr.de";
  const actual = getURLFromHTML(inputHTMLBody, inputBaseURL);
  const expected = [
    "https://service.muelheim-ruhr.de/href1/",
    "https://service.muelheim-ruhr.de/href2/",
  ];
  expect(actual).toEqual(expected);
});

// Test: Ignore invalid URLs in an HTML string
test("getURLsFromHTML invalid", () => {
  const inputHTMLBody = `
          <html>
              <body>
                  <a href="invalid">
                      Invalid URL
                  </a>
              </body>
          </html>
          `;
  const inputBaseURL = "https://service.muelheim-ruhr.de";
  const actual = getURLFromHTML(inputHTMLBody, inputBaseURL);
  const expected = [];
  expect(actual).toEqual(expected);
});

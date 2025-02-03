const { normalizeURL, getURLFromHTML } = require("./crawler");
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

const { JSDOM } = require("jsdom"); // Imports the JSDOM library for parsing HTML
const { createSecureContext } = require("tls"); // Imports createSecureContext from tls

// Asynchronous function to crawl a webpage
async function crawlPage(baseURL, currentURL, pages) {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  const normalizedCurrentURL = normalizeURL(currentURL);

  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;
  console.log(`actively crawling ${currentURL}`);

  try {
    const resp = await fetch(currentURL); // Performs an HTTP request to the URL

    // Checks if the response has an error status (400 or higher)
    if (resp.status > 399) {
      console.log(
        `error in fetch with status code: ${resp.status} on page ${currentURL} `
      );
      return pages;
    }

    const contentType = resp.headers.get("content-type"); // Checks the content type of the response
    if (!contentType.includes("text/html")) {
      console.log(
        `non-html response content type: ${contentType} on page ${currentURL} `
      );
      return pages;
    }

    const htmlBody = await resp.text();

    nextUrls = getURLFromHTML(htmlBody, baseURL);

    for (const nextURL of nextUrls) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    console.log(`error in fetch ${currentURL}`); // Handles network errors
  }
  return pages;
}

// Function extracts all links from an HTML page and returns a list of URLs
function getURLFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody); // Creates a DOM object from the HTML string
  const linkElements = dom.window.document.querySelectorAll("a"); // Finds all <a> elements

  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === "/") {
      // If the link is relative (starts with "/")
      try {
        const urlObj = new URL(`${baseURL}${linkElement.href}`); // Creates an absolute URL
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with relative url: ${err.message}`); // Error handling
      }
    } else {
      // If the link is absolute
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with absolute url: ${err.message}`);
      }
    }
  }

  return urls; // Returns the list of extracted URLs
}

// Function normalizes a URL by removing the protocol and trailing slash at the end
function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1); // Removes the trailing "/" if present
  }
  return hostPath;
}

// Exports the functions for use in other modules
module.exports = {
  normalizeURL,
  getURLFromHTML,
  crawlPage,
};

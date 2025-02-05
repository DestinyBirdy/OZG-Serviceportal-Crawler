const { JSDOM } = require("jsdom"); // Imports the JSDOM library for parsing HTML and extracting links
const { createSecureContext } = require("tls"); // Imports createSecureContext from the TLS module (not used in this script)

// Asynchronous function to crawl a webpage and extract links
async function crawlPage(baseURL, currentURL, pages) {
  const baseURLObj = new URL(baseURL); // Parse the base URL
  const currentURLObj = new URL(currentURL); // Parse the current URL

  // Ignore URLs from different domains
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  const normalizedCurrentURL = normalizeURL(currentURL); // Normalize the URL

  // If the page has already been crawled, increment the count
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  // Otherwise, mark this URL as visited and initialize the count
  pages[normalizedCurrentURL] = 1;
  console.log(`Actively crawling ${currentURL}`);

  try {
    const resp = await fetch(currentURL); // Perform an HTTP request to fetch the page content

    // Handle HTTP response errors (status 400 and above)
    if (resp.status > 399) {
      console.log(
        `Error in fetch with status code: ${resp.status} on page ${currentURL}`
      );
      return pages;
    }

    // Check if the response is an HTML page
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(
        `Non-HTML response content type: ${contentType} on page ${currentURL}`
      );
      return pages;
    }

    // Extract the HTML content from the response
    const htmlBody = await resp.text();

    // Extract all URLs from the HTML content
    const nextUrls = getURLFromHTML(htmlBody, baseURL);

    // Recursively crawl all extracted URLs
    for (const nextURL of nextUrls) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    console.log(`Error in fetch ${currentURL}`); // Handle network errors
  }
  return pages; // Return the updated list of crawled pages
}

// Function to extract all links from an HTML page and return a list of URLs
function getURLFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody); // Parse the HTML content into a DOM structure
  const linkElements = dom.window.document.querySelectorAll("a"); // Select all anchor elements

  for (const linkElement of linkElements) {
    if (linkElement.href.startsWith("/")) {
      // If the link is relative (starts with "/"), convert it to an absolute URL
      try {
        const urlObj = new URL(`${baseURL}${linkElement.href}`);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`Error with relative URL: ${err.message}`);
      }
    } else {
      // If the link is absolute, validate and add it
      try {
        const urlObj = new URL(linkElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`Error with absolute URL: ${err.message}`);
      }
    }
  }

  return urls; // Return the list of extracted URLs
}

// Function to normalize a URL by removing the protocol and any trailing slash
function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`; // Extract hostname and path

  // Remove trailing slash if it exists
  if (hostPath.length > 0 && hostPath.endsWith("/")) {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

// Export functions for use in other modules
module.exports = {
  normalizeURL,
  getURLFromHTML,
  crawlPage,
};

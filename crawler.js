const { JSDOM } = require("jsdom");

// Main function to crawl a page and recursively visit links on it.
async function crawlPage(baseURL, currentURL, pages) {
  // Convert the baseURL and currentURL to URL objects for easy comparison.
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  // If the current URL is not on the same domain as the base URL, stop crawling.
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  // Normalize the current URL to ensure it is in a consistent format (hostname + pathname).
  const normalizedCurrentURL = normalizeURL(currentURL);

  // If the URL has already been crawled, increment its visit count and return the pages object.
  if (pages[normalizedCurrentURL]) {
    pages[normalizedCurrentURL].count++;
    return pages;
  }

  // If the URL hasn't been crawled yet, add it to the pages object with a count of 1.
  pages[normalizedCurrentURL] = { count: 1, schluessel: null };
  console.log(`Actively crawling ${currentURL}`);

  try {
    // Fetch the HTML content of the current page.
    const resp = await fetch(currentURL);

    // If the HTTP response status is 400 or greater, log the error and return.
    if (resp.status > 399) {
      console.log(`Error ${resp.status} on page ${currentURL}`);
      return pages;
    }

    // Check if the content type is 'text/html'. If not, log the issue and return.
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`Non-HTML content: ${contentType} on ${currentURL}`);
      return pages;
    }

    // Read the HTML body from the response.
    const htmlBody = await resp.text();

    // Extract the 'schluessel' value from the HTML and store it in the pages object.
    pages[normalizedCurrentURL].schluessel = extractSchluessel(htmlBody);

    // Extract all the next URLs (links) from the page.
    const nextUrls = getURLFromHTML(htmlBody, baseURL);

    // Recursively crawl each of the extracted URLs (links) found on this page.
    for (const nextURL of nextUrls) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    // If there is an error during fetch, log the error message.
    console.log(`Fetch error on ${currentURL}: ${err.message}`);
  }

  // Return the updated pages object after crawling.
  return pages;
}

// Function to extract all the URLs from the HTML body of a page.
function getURLFromHTML(htmlBody, baseURL) {
  const urls = [];

  // Parse the HTML body into a DOM object using JSDOM.
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");

  // Iterate through each <a> tag found in the HTML.
  for (const linkElement of linkElements) {
    try {
      // Resolve relative URLs by combining with the base URL.
      const url = new URL(
        linkElement.href.startsWith("/")
          ? `${baseURL}${linkElement.href}`  // For relative paths, combine with base URL.
          : linkElement.href  // For absolute URLs, use the href directly.
      );
      urls.push(url.href);  // Add the resolved URL to the array.
    } catch (err) {
      // If an error occurs while constructing the URL, log it.
      console.log(`URL error: ${err.message}`);
    }
  }

  // Return the list of URLs found on the page.
  return urls;
}

// Function to extract the 'schluessel' value from the HTML content.
function extractSchluessel(htmlBody) {
  // Parse the HTML body into a DOM object using JSDOM.
  const dom = new JSDOM(htmlBody);
  
  // Query the DOM for the meta tag with property='schluessel'.
  const schluesselElement = dom.window.document.querySelector(
    "[property='schluessel']"
  );

  // If the meta tag exists, return its 'content' attribute value.
  // Otherwise, return null.
  return schluesselElement ? schluesselElement.getAttribute("content") : null;
}

// Function to normalize a URL (remove the trailing slash and keep the hostname + pathname).
function normalizeURL(urlString) {
  // Create a URL object from the URL string.
  const urlObj = new URL(urlString);
  
  // Construct the normalized path by combining the hostname and pathname.
  let path = `${urlObj.hostname}${urlObj.pathname}`;
  
  // If the path ends with a '/', remove it for consistency.
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

// Export the necessary functions to be used elsewhere.
module.exports = {
  normalizeURL,        // Export normalizeURL to normalize URLs.
  getURLFromHTML,      // Export getURLFromHTML to extract URLs from HTML pages.
  crawlPage,           // Export crawlPage to start the crawling process.
  extractSchluessel,   // Export extractSchluessel to extract specific data from the HTML.
};
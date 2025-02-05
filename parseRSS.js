const axios = require("axios"); // Importing the axios library for making HTTP requests
const fs = require("fs"); // Importing the filesystem (fs) module for file handling (although it's not used in this code)
const xml2js = require("xml2js"); // Importing the xml2js library for parsing XML data

// Function that downloads the RSS feed and searches the title for a specific element
async function downloadAndParseRSS(rssUrl, searchTitle) {
  // Checking if both the URL and search title are provided
  if (!rssUrl || !searchTitle) {
    console.error("Error: No URL or search title provided.");
    return; // Exit the function if either parameter is missing
  }

  try {
    console.log(`Attempting to download RSS feed from URL: ${rssUrl}`);

    // Ensuring the URL is valid by parsing it
    const parsedUrl = new URL(rssUrl); // This will throw an error if the URL is invalid

    // Downloading the RSS feed from the provided URL
    const response = await axios.get(parsedUrl.href); // Making a GET request to the URL
    const xmlData = response.data; // Storing the response data (RSS XML)

    // Parsing the XML data using xml2js
    const parser = new xml2js.Parser(); // Creating a new instance of xml2js parser
    const result = await parser.parseStringPromise(xmlData); // Parsing the XML data into a JavaScript object

    // Accessing the 'item' elements within the RSS feed
    const items = result.rss.channel[0].item;

    // Searching for an item with the specified title
    const foundItem = items.find((item) => item.title[0].includes(searchTitle));

    // Checking if an item was found and logging it
    if (foundItem) {
      console.log("Found Item:", foundItem);
    } else {
      // Logging a message if no item with the search title was found
      console.log(`No article found with the title "${searchTitle}".`);
    }
  } catch (error) {
    // Catching and logging errors that might occur during the download or parsing process
    console.error("Error downloading or parsing the RSS feed:", error.message);
  }
}

// Exporting the function so it can be used in other modules
module.exports = {
  downloadAndParseRSS,
};

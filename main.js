const { crawlPage } = require("./crawler.js"); // Imports the crawlPage function from crawler.js

function main() {
  if (process.argv.length < 3) {
    console.log("no website provided"); // Logs an error message if no URL is provided
    process.exit(1); // Exits the program with error code 1
  }
  if (process.argv.length > 3) {
    console.log("too many command line args"); // Logs an error message if too many arguments are passed
    process.exit(1); // Exits the program with error code 1
  }
  const baseURL = process.argv[2]; // Reads the website URL from command line arguments
  console.log(`starting crawl of ${baseURL}`); // Logs a message indicating that crawling is starting
  crawlPage(baseURL); // Starts crawling the specified website
}
main(); // Executes the main function

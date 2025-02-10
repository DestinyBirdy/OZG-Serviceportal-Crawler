const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { analyzeErrors } = require("./crawler"); // Function imported from crawler.js

// Function that generates and prints a report based on pages' data
function printReport(pages) {
  console.log("==============");
  console.log("REPORT");
  console.log("==============");

  // Perform error analysis
  analyzeErrors(pages);

  // Sort the pages by their 'count' in descending order
  const sortedPages = sortPages(pages);

  // Filter pages where the URL starts with 'service.muelheim-ruhr.de/leistung/'
  const filteredPages = sortedPages.filter((sortedPage) =>
    sortedPage[0].startsWith("service.muelheim-ruhr.de/leistung/")
  );

  // Map the filtered pages to a simpler structure containing URL, Hits, Key, and Errors
  const reportData = filteredPages.map((sortedPage) => {
    return {
      URL: sortedPage[0], // Page URL
      Hits: sortedPage[1].count, // Number of hits for the page
      Key: sortedPage[1].schluessel || "N/A", // The 'key' or 'N/A' if not available

      // Add number errors and abbreviation errors to separate columns
      NumberErrors: sortedPage[1].numberErrors
        ? sortedPage[1].numberErrors.join(", ")
        : "No Errors", // Number errors (comma-separated if multiple)
      AbbreviationErrors: sortedPage[1].abbreviationErrors
        ? sortedPage[1].abbreviationErrors.join(", ")
        : "No Errors", // Abbreviation errors (comma-separated if multiple)
    };
  });

  // Convert the report data (JSON format) into a worksheet
  const ws = XLSX.utils.json_to_sheet(reportData);

  // Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Get the file path for saving the report on the desktop
  const desktopPath = path.join(
    require("os").homedir(), // Get the user's home directory
    "Desktop", // Path to the Desktop folder
    "report.xlsx" // The name of the file to save
  );

  // Write the Excel file to the specified path (desktop)
  XLSX.writeFile(wb, desktopPath);

  console.log(`Excel report saved to: ${desktopPath}`);

  // Log the filtered pages with their 'count' and 'key' to the console
  for (const sortedPage of filteredPages) {
    console.log(
      `Found ${sortedPage[1].count} hits for page ${sortedPage[0]} with Key: ${
        sortedPage[1].schluessel || "N/A"
      }`
    );
    console.log(
      `NumberErrors: ${
        sortedPage[1].numberErrors
          ? sortedPage[1].numberErrors.join(", ")
          : "No Errors"
      }`
    );
    console.log(
      `AbbreviationErrors: ${
        sortedPage[1].abbreviationErrors
          ? sortedPage[1].abbreviationErrors.join(", ")
          : "No Errors"
      }`
    );
  }

  console.log("==============");
  console.log("END REPORT");
  console.log("==============");
}

// Function to sort the pages based on their 'count' in descending order
function sortPages(pages) {
  return Object.entries(pages).sort((a, b) => b[1].count - a[1].count);
}

// Function that could enable matching RSS to the report
function matchRSSToReport() {
  // Here, you could implement logic for matching the RSS feed
}

module.exports = {
  sortPages,
  printReport,
};

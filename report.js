const fs = require("fs"); // File system module for interacting with files (though not used in the code directly)
const path = require("path"); // Path module for working with file paths
const XLSX = require("xlsx"); // Library for creating and handling Excel files

// Function that generates and prints a report based on pages' data
function printReport(pages) {
  console.log("==============");
  console.log("REPORT");
  console.log("==============");

  // Sorts the pages by their 'count' property in descending order
  const sortedPages = sortPages(pages);

  // Filters pages where the URL starts with 'service.muelheim-ruhr.de/leistung/'
  const filteredPages = sortedPages.filter((sortedPage) =>
    sortedPage[0].startsWith("service.muelheim-ruhr.de/leistung/")
  );

  // Maps the filtered pages to a simplified structure containing URL, Hits, and Schluessel (key)
  const reportData = filteredPages.map((sortedPage) => {
    return {
      URL: sortedPage[0], // Page URL
      Hits: sortedPage[1].count, // Number of hits for the page
      Schluessel: sortedPage[1].schluessel || "N/A", // The 'schluessel' (key) or 'N/A' if not available
    };
  });

  // Converts the report data (JSON format) into a worksheet
  const ws = XLSX.utils.json_to_sheet(reportData);

  // Creates a new workbook and appends the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Gets the file path for saving the report on the desktop
  const desktopPath = path.join(
    require("os").homedir(), // Gets the user's home directory
    "Desktop", // Path to the Desktop folder
    "report.xlsx" // The name of the file to save
  );

  // Writes the Excel file to the specified path (desktop)
  XLSX.writeFile(wb, desktopPath);

  console.log(`Excel report saved to: ${desktopPath}`);

  // Logs the filtered pages with their 'count' and 'schluessel' to the console
  for (const sortedPage of filteredPages) {
    console.log(
      `Found ${sortedPage[1].count} links to page ${
        sortedPage[0]
      } with Schluessel: ${sortedPage[1].schluessel || "N/A"}`
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

// Exports the functions to make them available outside of this module
module.exports = {
  sortPages,
  printReport,
};

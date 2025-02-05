const fs = require("fs"); // File system module for interacting with files
const path = require("path"); // Path module for working with file paths
const XLSX = require("xlsx"); // Library for creating and handling Excel files

// Function to generate and print a report from the given pages data
function printReport(pages) {
  console.log("==============");
  console.log("REPORT");
  console.log("==============");

  // Sort the pages based on the number of hits
  const sortedPages = sortPages(pages);

  // Filter only the pages that contain the desired path
  const filteredPages = sortedPages.filter((sortedPage) => {
    const url = sortedPage[0];
    return url.startsWith("service.muelheim-ruhr.de/leistung/");
  });

  // Create an array of objects containing data for the Excel report
  const reportData = filteredPages.map((sortedPage) => {
    return { URL: sortedPage[0], Hits: sortedPage[1] };
  });

  // Create an Excel sheet from the data
  const ws = XLSX.utils.json_to_sheet(reportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Determine the desktop path (example for Windows)
  const desktopPath = path.join(
    require("os").homedir(),
    "Desktop",
    "report.xlsx"
  );

  // Save the Excel file to the desktop
  XLSX.writeFile(wb, desktopPath);

  // Output the saved file path
  console.log(`Excel report saved to: ${desktopPath}`);

  // Print the filtered pages in the console
  for (const sortedPage of filteredPages) {
    const url = sortedPage[0];
    const hits = sortedPage[1];
    console.log(`Found ${hits} links to page ${url}`);
  }

  console.log("==============");
  console.log("END REPORT");
  console.log("==============");
}

// Function to sort pages based on the number of hits in descending order
function sortPages(pages) {
  const pagesArr = Object.entries(pages); // Convert object to an array of key-value pairs
  pagesArr.sort((a, b) => {
    return b[1] - a[1]; // Sort in descending order based on hits
  });
  return pagesArr;
}

// Export functions for use in other modules
module.exports = {
  sortPages,
  printReport,
};

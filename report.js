const fs = require("fs"); // File system module for interacting with files
const path = require("path"); // Path module for working with file paths
const XLSX = require("xlsx"); // Library for creating and handling Excel files

function printReport(pages) {
  console.log("==============");
  console.log("REPORT");
  console.log("==============");

  const sortedPages = sortPages(pages);
  const filteredPages = sortedPages.filter((sortedPage) =>
    sortedPage[0].startsWith("service.muelheim-ruhr.de/leistung/")
  );

  const reportData = filteredPages.map((sortedPage) => {
    return {
      URL: sortedPage[0],
      Hits: sortedPage[1].count,
      Schluessel: sortedPage[1].schluessel || "N/A",
    };
  });

  const ws = XLSX.utils.json_to_sheet(reportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const desktopPath = path.join(
    require("os").homedir(),
    "Desktop",
    "report.xlsx"
  );
  XLSX.writeFile(wb, desktopPath);

  console.log(`Excel report saved to: ${desktopPath}`);
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

function sortPages(pages) {
  return Object.entries(pages).sort((a, b) => b[1].count - a[1].count);
}

module.exports = {
  sortPages,
  printReport,
};

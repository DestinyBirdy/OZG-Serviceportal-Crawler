const axios = require("axios");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// Function to download the XLSX file from the specified URL
async function downloadXlsxFile() {
  const url =
    "https://wsp-veroeffentlichungen.nrw/wp-content/uploads/Live-11.11-1.xlsx"; // URL of the XLSX file to download
  const filePath = path.join(__dirname, "Live-11.11-1.xlsx"); // Path where the file will be saved

  try {
    // Make GET request to download the file as binary data
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer", // Ensures the file is downloaded as binary
    });

    // Write the downloaded data to a file on disk
    fs.writeFileSync(filePath, response.data);
    console.log("Download complete:", filePath); // Log when download is complete
  } catch (error) {
    // Handle any errors that occur during the download process
    console.error("Error downloading the file:", error.message);
  }
}

// Function to compare two XLSX files and write missing or matching entries to new files
function compareAndWriteMissingAndMatchingEntries() {
  // Read the two XLSX files (Live data and Report)
  const liveFile = xlsx.readFile("Live-11.11-1.xlsx");
  const reportFile = xlsx.readFile("report.xlsx");

  // Get the first sheet in both files (assuming the data is in the first sheet)
  const liveSheet = liveFile.Sheets[liveFile.SheetNames[0]];
  const reportSheet = reportFile.Sheets[reportFile.SheetNames[0]];

  // Convert the sheets into JSON format for easier manipulation
  const liveData = xlsx.utils.sheet_to_json(liveSheet, { defval: "" });
  const reportData = xlsx.utils.sheet_to_json(reportSheet, { defval: "" });

  // Ensure "Nummer" column is treated as a string to prevent scientific notation
  liveData.forEach((row) => {
    row["Nummer"] = row["Nummer"].toString(); // Convert Nummer to string
  });

  // Extract "Nummer" column from liveData and "Key" column from reportData
  const liveNumbers = liveData.map((row) => row["Nummer"]);
  const reportKeys = reportData.map((row) => row["Key"]);

  // Find missing entries (Nummer from liveData not found in reportData)
  const missingEntries = liveData.filter(
    (row) => !reportKeys.includes(row["Nummer"])
  );

  // Find matching entries (Nummer from liveData found in reportData)
  const matchingEntries = liveData.filter((row) =>
    reportKeys.includes(row["Nummer"])
  );

  // Write missing entries to a new file if there are any
  if (missingEntries.length > 0) {
    // Prepare the data to be written in the new file
    const missingData = missingEntries.map((row) => ({
      Nummer: row["Nummer"],
      Name: row["Name"],
      Landingpage: row["Landingpage"],
      Direktlink: row["Direktlink"],
      Stelle: row["Stelle"],
    }));

    // Create a new sheet for missing entries
    const missingSheet = xlsx.utils.json_to_sheet(missingData);
    const newWorkbookMissing = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
      newWorkbookMissing,
      missingSheet,
      "Missing Entries"
    );
    // Write the missing entries to 'missingEntries.xlsx'
    xlsx.writeFile(newWorkbookMissing, "missingEntries.xlsx");
    console.log(
      `Missing entries with details written to 'missingEntries.xlsx'`
    );
  } else {
    console.log("No missing entries found.");
  }

  // Write matching entries to a new file if there are any
  if (matchingEntries.length > 0) {
    // Prepare the data to be written in the new file
    const matchingData = matchingEntries.map((row) => ({
      Nummer: row["Nummer"],
      Name: row["Name"],
      Landingpage: row["Landingpage"],
      Direktlink: row["Direktlink"],
      Stelle: row["Stelle"],
    }));

    // Create a new sheet for matching entries
    const matchingSheet = xlsx.utils.json_to_sheet(matchingData);
    const newWorkbookMatching = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(
      newWorkbookMatching,
      matchingSheet,
      "Matching Entries"
    );
    // Write the matching entries to 'matchingEntries.xlsx'
    xlsx.writeFile(newWorkbookMatching, "matchingEntries.xlsx");
    console.log(
      `Matching entries with details written to 'matchingEntries.xlsx'`
    );
  } else {
    console.log("No matching entries found.");
  }
}

// Export the functions so they can be used elsewhere in the application
module.exports = {
  downloadXlsxFile,
  compareAndWriteMissingAndMatchingEntries,
};

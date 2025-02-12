const axios = require("axios");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

async function downloadXlsxFile() {
  const url =
    "https://wsp-veroeffentlichungen.nrw/wp-content/uploads/Live-11.11-1.xlsx";
  const filePath = path.join(__dirname, "Live-11.11-1.xlsx");

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer", // Ensures the file is downloaded as binary
    });

    fs.writeFileSync(filePath, response.data);
    console.log("Download complete:", filePath);
  } catch (error) {
    console.error("Error downloading the file:", error.message);
  }
}

// Function to compare the two Excel files and write missing entries to a new file
function compareAndWriteMissingEntries() {
  // Read the two files
  const liveFile = xlsx.readFile("Live-11.11-1.xlsx");
  const reportFile = xlsx.readFile("report.xlsx");

  // Get the first sheet in both files (assuming the data is in the first sheet)
  const liveSheet = liveFile.Sheets[liveFile.SheetNames[0]];
  const reportSheet = reportFile.Sheets[reportFile.SheetNames[0]];

  // Convert sheets to JSON
  const liveData = xlsx.utils.sheet_to_json(liveSheet);
  const reportData = xlsx.utils.sheet_to_json(reportSheet);

  // Extract "Nummer" column from liveData and "Key" column from reportData
  const liveNumbers = liveData.map((row) => row["Nummer"]);
  const reportKeys = reportData.map((row) => row["Key"]);

  // Find missing entries (Nummer from liveData not found in reportData)
  const missingEntries = liveNumbers.filter((num) => !reportKeys.includes(num));

  // If there are missing entries, create a new worksheet and write the missing values
  if (missingEntries.length > 0) {
    const missingSheet = xlsx.utils.json_to_sheet(
      missingEntries.map((num) => ({ Nummer: num }))
    );

    // Create a new workbook and append the missing sheet
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, missingSheet, "Missing Entries");

    // Write the new workbook to a file
    xlsx.writeFile(newWorkbook, "missingEntries.xlsx");
    console.log(`Missing entries written to 'missingEntries.xlsx'`);
  } else {
    console.log("No missing entries found.");
  }
}

module.exports = {
  downloadXlsxFile,
  extractColumnValues,
  compareAndWriteMissingEntries,
};

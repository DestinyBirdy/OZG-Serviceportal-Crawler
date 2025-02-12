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

function extractColumnValues(filePath, columnName) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    return jsonData
      .map((row) => row[columnName])
      .filter((value) => value !== undefined);
  } catch (error) {
    console.error("Error reading the Excel file:", error.message);
    return [];
  }
}

function compareAndWriteMatches(
  sourceFile,
  testFile,
  sourceColumn,
  testColumn
) {
  try {
    const sourceValues = new Set(extractColumnValues(sourceFile, sourceColumn));
    const workbook = xlsx.readFile(testFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let jsonData = xlsx.utils.sheet_to_json(worksheet);

    jsonData = jsonData.map((row) => {
      row["Match Found"] = sourceValues.has(row[testColumn]) ? "Yes" : "No";
      return row;
    });

    const newWorksheet = xlsx.utils.json_to_sheet(jsonData);
    workbook.Sheets[sheetName] = newWorksheet;
    xlsx.writeFile(workbook, testFile);
    console.log("Updated test.xlsx with match results.");
  } catch (error) {
    console.error("Error processing the comparison:", error.message);
  }
}

const sourceFile = path.join(__dirname, "Live-11.11-1.xlsx");
const testFile = path.join(__dirname, "test.xlsx");
compareAndWriteMatches(sourceFile, testFile, "Nummer", "Key");

module.exports = {
  downloadXlsxFile,
  extractColumnValues,
  compareAndWriteMatches,
};

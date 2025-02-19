// Import the mysql2 library for database operations
const mysql = require("mysql2");

// Import the analyzeErrors function from the crawler module
const { analyzeErrors } = require("./crawler");

// Establish a connection to the MySQL database
const db = mysql.createConnection({
  host: "localhost", // Database host
  user: "admin", // Your MySQL username
  password: "admin", // Your MySQL password
  database: "ozg_db", // Name of the database to connect to
});

// Test the connection to the database
db.connect((err) => {
  if (err) {
    // Log an error message if the connection fails
    console.error("Error connecting to the OZG database:", err);
    return; // Exit the connection attempt
  }
  // Log a success message if the connection is established
  console.log("✅ Connected to the OZG database!");
});

// Function to save data to the OZG database
async function saveToDatabase(reportData) {
  // SQL command to clear the ozg_analyse table before adding new data
  const truncateSql = `TRUNCATE TABLE ozg_analyse`;

  try {
    // Execute the truncate command to empty the table
    await new Promise((resolve, reject) => {
      db.query(truncateSql, (err, result) => {
        if (err) {
          // Reject the promise if there is an error
          reject(err);
        } else {
          // Log success message when the table is truncated
          console.log("✅ Table ozg_analyse has been truncated!");
          resolve(result); // Resolve the promise when successful
        }
      });
    });
  } catch (err) {
    // Log an error message if truncating fails
    console.error("❌ Error truncating table:", err);
    return; // Exit the function if truncating fails
  }

  // SQL command to insert data into the ozg_analyse table
  const sql = `
      INSERT INTO ozg_analyse (url, hits, key_text, number_errors, abbreviation_errors)
      VALUES (?, ?, ?, ?, ?)
  `;

  // Iterate over each entry in the report data
  for (const entry of reportData) {
    try {
      // Execute the insert command for each entry
      await new Promise((resolve, reject) => {
        db.query(
          sql,
          [
            entry.URL, // URL of the page
            entry.Hits, // Number of hits for the page
            entry.Key, // Key text for the page
            entry.NumberErrors, // Number errors associated with the page
            entry.AbbreviationErrors, // Abbreviation errors associated with the page
          ],
          (err, result) => {
            if (err) {
              // Reject the promise if there is an error during insertion
              reject(err);
            } else {
              // Log success message when an entry is successfully added
              console.log(`✅ Entry successfully added: ${entry.URL}`);
              resolve(result); // Resolve the promise when successful
            }
          }
        );
      });
    } catch (err) {
      // Log an error message if an error occurs with the entry
      console.error(`❌ Error with entry: ${entry.URL}`, err);
    }
  }

  // Log a success message indicating all entries have been saved
  console.log("✅ All entries have been successfully saved!");
}

// Function that creates the report and saves it to the database
async function printReport(pages) {
  // Log the start of the report
  console.log("==============");
  console.log("📊 OZG REPORT");
  console.log("==============");

  // Analyze the errors in the provided pages
  analyzeErrors(pages);

  // Sort the pages by the number of hits (in descending order)
  const sortedPages = sortPages(pages);

  // Filter the sorted pages to include only those with a specific URL structure
  const filteredPages = sortedPages.filter((sortedPage) =>
    sortedPage[0].startsWith("service.muelheim-ruhr.de/leistung/")
  );

  // Prepare the data for the database
  const reportData = filteredPages.map((sortedPage) => ({
    URL: sortedPage[0], // Page URL
    Hits: sortedPage[1].count, // Number of hits for the page
    Key: sortedPage[1].schluessel || "N/A", // Key text for the page or "N/A" if not available
    NumberErrors: sortedPage[1].numberErrors
      ? sortedPage[1].numberErrors.join(", ") // Join number errors into a string if available
      : "No Errors", // Default message if no errors
    AbbreviationErrors: sortedPage[1].abbreviationErrors
      ? sortedPage[1].abbreviationErrors.join(", ") // Join abbreviation errors into a string if available
      : "No Errors", // Default message if no errors
  }));

  // Log the report data for debugging purposes
  console.log("==============");
  console.log(reportData);
  console.log("==============");

  // Save the prepared data to the OZG database
  await saveToDatabase(reportData);

  // Log a success message indicating the data has been saved
  console.log("✅ Data has been successfully transferred to the OZG database!");
  console.log("==============");
  console.log("📊 END OZG REPORT");
  console.log("==============");
}

// Helper function to sort the pages by the number of hits
function sortPages(pages) {
  // Convert the pages object into an array and sort it by the count in descending order
  return Object.entries(pages).sort((a, b) => b[1].count - a[1].count);
}

// Export the functions so they can be used in other modules
module.exports = {
  sortPages,
  printReport,
};

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { analyzeErrors } = require("./crawler"); // Funktion aus crawler.js einbinden

function printReport(pages) {
  console.log("==============");
  console.log("REPORT");
  console.log("==============");

  // Fehleranalyse durchführen
  analyzeErrors(pages);

  // Seiten nach 'count' in absteigender Reihenfolge sortieren
  const sortedPages = sortPages(pages);

  // Seiten filtern, die mit der URL 'service.muelheim-ruhr.de/leistung/' beginnen
  const filteredPages = sortedPages.filter((sortedPage) =>
    sortedPage[0].startsWith("service.muelheim-ruhr.de/leistung/")
  );

  // Mapping der gefilterten Seiten zu einem einfacheren Datenformat
  const reportData = filteredPages.map((sortedPage) => {
    return {
      URL: sortedPage[0], // Seiten-URL
      Hits: sortedPage[1].count, // Anzahl der Hits auf der Seite
      Schluessel: sortedPage[1].schluessel || "N/A", // Schlüssel der Seite
      Fehler: sortedPage[1].fehler ? sortedPage[1].fehler.join(", ") : "Keine Fehler" // Fehler, falls vorhanden
    };
  });

  // Umwandeln der Report-Daten in ein Excel-Arbeitsblatt
  const ws = XLSX.utils.json_to_sheet(reportData);

  // Erstellen eines neuen Arbeitsbuchs und Hinzufügen des Arbeitsblatts
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Datei speichern auf dem Desktop
  const desktopPath = path.join(
    require("os").homedir(),
    "Desktop",
    "report.xlsx"
  );

  // Excel-Datei speichern
  XLSX.writeFile(wb, desktopPath);

  console.log(`Excel report saved to: ${desktopPath}`);

  // Geloggte gefilterte Seiten mit Anzahl der Hits und Fehler
  for (const sortedPage of filteredPages) {
    console.log(
      `Found ${sortedPage[1].count} hits for page ${sortedPage[0]} with Schluessel: ${sortedPage[1].schluessel || "N/A"} and Errors: ${sortedPage[1].fehler ? sortedPage[1].fehler.join(", ") : "Keine Fehler"}`
    );
  }

  console.log("==============");
  console.log("END REPORT");
  console.log("==============");
}

// Funktion zum Sortieren der Seiten basierend auf der Anzahl der Hits
function sortPages(pages) {
  return Object.entries(pages).sort((a, b) => b[1].count - a[1].count);
}

// Funktion, die den Abgleich mit dem RSS-Feed ermöglichen könnte
function matchRSSToReport() {
  // Hier könnte eine Logik für den Abgleich mit RSS implementiert werden
}

module.exports = {
  sortPages,
  printReport,
};
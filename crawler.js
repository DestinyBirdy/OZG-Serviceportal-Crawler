const { JSDOM } = require("jsdom");

// Liste ausgeschriebener Zahlen und unerwünschter Abkürzungen
const zahlenAlsWort = [
  "eins",
  "zwei",
  "drei",
  "vier",
  "fünf",
  "sechs",
  "sieben",
  "acht",
  "neun",
  "zehn",
  "elf",
  "zwölf",
  "dreizehn",
  "vierzehn",
  "fünfzehn",
  "sechzehn",
  "siebzehn",
  "achtzehn",
  "neunzehn",
  "zwanzig",
];
const abkuerzungen = ["bzw.", "etc.", "u.a.", "d.h."];

async function crawlPage(baseURL, currentURL, pages) {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  const normalizedCurrentURL = normalizeURL(currentURL);

  if (pages[normalizedCurrentURL]) {
    pages[normalizedCurrentURL].count++;
    return pages;
  }

  pages[normalizedCurrentURL] = { count: 1, schluessel: null, htmlBody: "" };
  console.log(`Crawling: ${currentURL}`);

  try {
    const resp = await fetch(currentURL);
    if (resp.status > 399) {
      console.log(`Error ${resp.status} on page ${currentURL}`);
      return pages;
    }

    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`Non-HTML content: ${contentType} on ${currentURL}`);
      return pages;
    }

    const htmlBody = await resp.text();
    pages[normalizedCurrentURL].schluessel = extractSchluessel(htmlBody);
    pages[normalizedCurrentURL].htmlBody = htmlBody;

    const nextUrls = getURLFromHTML(htmlBody, baseURL);
    for (const nextURL of nextUrls) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (err) {
    console.log(`Fetch error on ${currentURL}: ${err.message}`);
  }

  return pages;
}

// Neue Funktion zur Fehlerprüfung für alle Einträge am Ende
function analyzeErrors(pages) {
  for (const [url, data] of Object.entries(pages)) {
    pages[url].fehler = findErrors(data.htmlBody);
    delete pages[url].htmlBody; // Speicher sparen nach der Analyse
  }
}

function findErrors(htmlBody) {
  const errors = [];
  const dom = new JSDOM(htmlBody);
  const textContent = dom.window.document.body.textContent.toLowerCase();

  zahlenAlsWort.forEach((zahl) => {
    if (textContent.includes(zahl)) {
      errors.push(`Zahl als Wort: ${zahl}`);
    }
  });

  abkuerzungen.forEach((abk) => {
    if (textContent.includes(abk)) {
      errors.push(`Abkürzung gefunden: ${abk}`);
    }
  });

  return errors;
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  let path = `${urlObj.hostname}${urlObj.pathname}`;
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function getURLFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");
  for (const linkElement of linkElements) {
    try {
      const url = new URL(
        linkElement.href.startsWith("/")
          ? `${baseURL}${linkElement.href}`
          : linkElement.href
      );
      urls.push(url.href);
    } catch (err) {
      console.log(`URL error: ${err.message}`);
    }
  }
  return urls;
}

function extractSchluessel(htmlBody) {
  const dom = new JSDOM(htmlBody);
  const schluesselElement = dom.window.document.querySelector(
    "[property='schluessel']"
  );
  return schluesselElement ? schluesselElement.getAttribute("content") : null;
}

// Export der Funktionen
module.exports = {
  crawlPage,
  analyzeErrors,
  normalizeURL,
  getURLFromHTML,
  extractSchluessel, // Hier hinzugefügt, damit sie von anderen Modulen genutzt werden kann
};

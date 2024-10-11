//  const scrapedData = JSON.parse(localStorage.getItem('scrapedData')) || [];
// populateTable(scrapedData);
getStoredData().then((scrapedData) => {
    populateTable(scrapedData || []);
});
  
document.getElementById('scrapeButton').addEventListener('click', () => {

  const spinner = document.getElementById('spinner');


  
  // Zeige den Spinner an
  spinner.style.display = 'inline-block';

  // Nachricht an das aktive Tab (Google Maps Seite) senden
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape' });
  });
});

// Empfange die Scraping-Daten und aktualisiere die Tabelle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTable') {
    populateTable(request.data);

    // Verstecke den Spinner nach Abschluss des Scraping-Prozesses
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'none';
  }
});

function populateTable(data) {
  const tableBody = document.querySelector("#resultsTable tbody");
  tableBody.innerHTML = ""; // Clear existing data

  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td><a href="${row.website}" target="_blank">${row.website}</a></td>
      <td>${row.contactPerson}</td>
    `;
    tableBody.appendChild(tr);
  });
}


// Download as CSV button event listener
document.getElementById("downloadButton").addEventListener("click", () => {
  const fileName = document.getElementById("fileName").value || "scraped_data";
  getStoredData().then((scrapedData) => {
    downloadCSV(scrapedData || [], fileName);
  });
});

// Function to download data as CSV
function downloadCSV(data, fileName) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    ["Title,Phone,Website,Contact Person\n"]
      .concat(
        data.map(
          (row) =>
            `${row.name},${row.phone},${row.website},${row.contactPerson}`
        )
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link); // Clean up
}

// Funktion, um Daten aus Chrome Storage abzurufen
function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get('scrapedData', (result) => {
      resolve(result.scrapedData);
    });
  });
}
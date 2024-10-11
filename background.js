chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    scrapeGoogleMaps();  // Start scraping
  }
});

async function scrapeGoogleMaps() {
  let companyList = await getStoredData() || [];

  // Example DOM classes for scraping
  const companyElements = document.querySelectorAll('.lI9IFe');

  for (let company of companyElements) {
    const name = company.querySelector('.qBF1Pd')?.textContent || '-';
    const websiteElement = company.querySelector('.lcr4fd');
    const phone = company.querySelector('.UsdlK')?.textContent || '-';
    const website = websiteElement ? websiteElement.href : 'No website';

    let contactPerson = 'No contact found';
    if (website !== 'No website') {
      // contactPerson = await getContactPerson(website); // Search websites
    }

    if (website !== 'No website' && !website.includes('google.')) {
      companyList.push({ name, phone, website, contactPerson });
    }
    // Save data
    await storeData(companyList);
  }

  // Inform the user when scraping is completed
  chrome.runtime.sendMessage({ action: 'scrapingCompleted', data: companyList });
}

// async function getContactPerson(websiteUrl) {
//   try {
//     const response = await fetch(websiteUrl);
//     const text = await response.text();
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, 'text/html');

//     const impressumLink = doc.querySelector('a[href*="impressum"], a[href*="Impressum"]');
//     if (impressumLink) {
//       const impressumResponse = await fetch(impressumLink.href);
//       const impressumText = await impressumResponse.text();
//       const impressumDoc = parser.parseFromString(impressumText, 'text/html');

//       const possibleContacts = impressumDoc.querySelectorAll('p, div, span');
//       for (let contact of possibleContacts) {
//         const text = contact.textContent.toLowerCase();
//         if (text.includes('geschäftsführer') || text.includes('ceo') || text.includes('ansprechpartner')) {
//           return contact.textContent.trim();
//         }
//       }
//       return 'No contact found';
//     } else {
//       return 'No impressum found';
//     }
//   } catch (error) {
//     console.error(`Error fetching ${websiteUrl}:`, error);
//     return 'Error fetching website';
//   }
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadCSV') {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += request.data;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  }
});

// Funktion, um Daten in Chrome Storage zu speichern
function storeData(companyList) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ scrapedData: companyList }, () => {
      resolve();
    });
  });
}

// Funktion, um Daten aus dem Chrome Storage abzurufen
function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get('scrapedData', (result) => {
      resolve(result.scrapedData);
    });
  });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    scrapeGoogleMaps();  // Starte das Scraping
  }
});

async function scrapeGoogleMaps() {
  let companyList = [];
  
  // Hier deine Google Maps Scraping-Logik
  const companyElements = document.querySelectorAll('.lI9IFe'); // Beispiel Klasse

  for (let company of companyElements) {
    const name = company.querySelector('.qBF1Pd')?.textContent || '-';
    const websiteElement = company.querySelector('.lcr4fd');
    const phone = company.querySelector('.UsdlK')?.textContent || '-';
    const website = websiteElement ? websiteElement.href : 'No website';

    let contactPerson = 'No contact found';
    if (website !== 'No website') {
      // contactPerson = await getContactPerson(website); // Webseiten durchsuchen
    }

    if (website !== 'No website' && !website.includes('google.')) {
      companyList.push({ name, phone, website, contactPerson });
    }
  }

  // Daten an das Popup zurücksenden (optional)
  chrome.runtime.sendMessage({ action: 'updateTable', data: companyList });
}

async function getContactPerson(websiteUrl) {
  try {
    const response = await fetch(websiteUrl);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Suchen nach Impressum-Link
    const impressumLink = doc.querySelector('a[href*="impressum"], a[href*="Impressum"]');
    if (impressumLink) {
      const impressumResponse = await fetch(impressumLink.href);
      const impressumText = await impressumResponse.text();
      const impressumDoc = parser.parseFromString(impressumText, 'text/html');

      // Suche nach Kontaktpersonen (Geschäftsführer, Ansprechpartner etc.)
      const possibleContacts = impressumDoc.querySelectorAll('p, div, span');
      for (let contact of possibleContacts) {
        const text = contact.textContent.toLowerCase();
        if (text.includes('geschäftsführer') || text.includes('ceo') || text.includes('ansprechpartner')) {
          return contact.textContent.trim();
        }
      }
      return 'No contact found';
    } else {
      return 'No impressum found';
    }
  } catch (error) {
    console.error(`Error fetching ${websiteUrl}:`, error);
    return 'Error fetching website';
  }
}
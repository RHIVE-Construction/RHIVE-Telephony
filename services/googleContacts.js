/**
 * RHIVE Telephony - Google Contacts Sync Service
 * Integrates Google People API with rhive_token.json to sync executive Google Contacts
 * into the sovereign softphone dialer and live incoming caller resolution.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

let cachedContacts = [];
let lastSyncTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getOAuthClient() {
  const tokenPath = path.join(__dirname, '..', 'config', 'rhive_token.json');
  if (!fs.existsSync(tokenPath)) {
    return null;
  }
  try {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const oAuth2Client = new google.auth.OAuth2(token.client_id, token.client_secret);
    oAuth2Client.setCredentials({ refresh_token: token.refresh_token });
    return oAuth2Client;
  } catch (err) {
    console.warn('[Google Contacts Auth Note]', err.message);
    return null;
  }
}

/**
 * Normalizes phone numbers to standard 10-digit digits for O(1) matching
 */
function cleanDigits(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/**
 * Fetches connections from Google People API with in-memory caching
 */
async function fetchGoogleContacts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedContacts.length > 0 && (now - lastSyncTime < CACHE_TTL_MS)) {
    return cachedContacts;
  }

  const auth = getOAuthClient();
  if (!auth) {
    return cachedContacts;
  }

  try {
    const people = google.people({ version: 'v1', auth });
    let allConnections = [];
    let pageToken = undefined;

    // Fetch up to 250 contacts per batch
    do {
      const res = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 100,
        pageToken,
        personFields: 'names,emailAddresses,phoneNumbers,addresses,organizations,photos'
      });

      const list = res.data.connections || [];
      allConnections = allConnections.concat(list);
      pageToken = res.data.nextPageToken;
    } while (pageToken && allConnections.length < 300);

    const formatted = allConnections.map(c => {
      const name = c.names?.[0]?.displayName || c.names?.[0]?.unstructuredName || 'Unknown Contact';
      const givenName = c.names?.[0]?.givenName || '';
      const familyName = c.names?.[0]?.familyName || '';
      const phones = (c.phoneNumbers || []).map(p => ({
        number: p.value || '',
        clean: cleanDigits(p.value || ''),
        type: p.type || 'mobile'
      })).filter(p => p.clean.length >= 7);
      
      const primaryPhone = phones[0]?.number || '';
      const emails = (c.emailAddresses || []).map(e => e.value || '').filter(Boolean);
      const addresses = (c.addresses || []).map(a => a.formattedValue || a.streetAddress || '').filter(Boolean);
      const organization = c.organizations?.[0]?.name || c.organizations?.[0]?.title || '';
      const photo = c.photos?.[0]?.url || '';

      return {
        resourceName: c.resourceName,
        name,
        givenName,
        familyName,
        primaryPhone,
        phones,
        emails,
        addresses,
        organization,
        photo,
        initials: (givenName && familyName) ? `${givenName[0]}${familyName[0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
      };
    }).filter(c => c.primaryPhone || c.emails.length > 0);

    cachedContacts = formatted;
    lastSyncTime = now;
    console.log(`[Google Contacts] Successfully synchronized ${cachedContacts.length} contacts from Google People API.`);
    return cachedContacts;
  } catch (err) {
    console.warn('[Google Contacts Fetch Error]', err.message);
    return cachedContacts;
  }
}

/**
 * Fast lookup of contact info by phone number
 */
async function lookupContactByPhone(phoneNumber) {
  const target = cleanDigits(phoneNumber);
  if (!target || target.length < 7) return null;

  const contacts = await fetchGoogleContacts();
  for (const c of contacts) {
    for (const p of c.phones) {
      if (p.clean.includes(target) || target.includes(p.clean)) {
        return c;
      }
    }
  }
  return null;
}

module.exports = {
  fetchGoogleContacts,
  lookupContactByPhone,
  cleanDigits
};

/**
 * Lead receiver for Kelly's website.
 * Paste this into a Google Apps Script project bound to your "Website Leads" Google Sheet,
 * then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 * See SETUP.md for step-by-step instructions.
 */

// Email address for new-lead alerts. Leave '' to use the Google account that owns the script.
const NOTIFY_EMAIL = '';
const SHEET_NAME = 'Leads';

const COLUMNS = [
  ['Received', r => new Date()],
  ['Source', r => r.source],
  ['Name', r => r.name],
  ['Phone', r => r.phone],
  ['WhatsApp link', r => r.phone ? 'https://wa.me/' + toIntlMy(r.phone) : ''],
  ['Email', r => r.email],
  ['Wants consult', r => r.wantsConsult],
  ['Topics', r => r.topics],
  ['Meeting type', r => r.meetingType],
  ['Meeting language', r => r.meetingLang],
  ['Message', r => r.message],
  ['Age', r => c(r).currentAge],
  ['Retire age', r => c(r).retireAge],
  ['Last to age', r => c(r).lifeExp],
  ['Monthly spend (RM)', r => c(r).monthlyExpense],
  ['EPF balance', r => c(r).epfBalance],
  ['EPF monthly', r => c(r).epfMonthly],
  ['Savings balance', r => c(r).savingsBalance],
  ['Savings monthly', r => c(r).savingsMonthly],
  ['Needed at retirement', r => c(r).neededAtRetirement],
  ['Projected at retirement', r => c(r).projectedAtRetirement],
  ['Gap (-) / Surplus', r => c(r).gap],
  ['Money runs out at', r => c(r).moneyRunsOutAge],
  ['Required monthly', r => c(r).requiredMonthly],
  ['Site language', r => r.lang],
  ['Page', r => r.page],
  ['Referrer', r => r.referrer],
  ['utm_source', r => r.utm_source],
  ['utm_medium', r => r.utm_medium],
  ['utm_campaign', r => r.utm_campaign],
  ['Consent', r => r.consent],
  ['Status', r => 'New']
];

function c(r) { return r.calc || {}; }

// 012-345 6789 → 60123456789
function toIntlMy(phone) {
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('0')) d = '6' + d;
  return d;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const r = JSON.parse(e.postData.contents || '{}');
    if (!r.name || !(r.phone || r.email)) return json({ ok: false, error: 'missing fields' });
    // Trim everything to sane lengths and neutralise spreadsheet formulas
    Object.keys(r).forEach(k => { if (typeof r[k] === 'string') r[k] = safe(r[k]); });

    const sheet = getSheet();
    sheet.appendRow(COLUMNS.map(([, fn]) => { const v = fn(r); return v === undefined ? '' : v; }));
    notify(r);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: 'kelly-portal leads' });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([h]) => h));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#FBF7EE');
  }
  return sheet;
}

function notify(r) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  if (!to) return;
  const calc = r.calc
    ? `\nCalculator: age ${r.calc.currentAge} → retire ${r.calc.retireAge}, gap RM ${Number(r.calc.gap).toLocaleString()}` +
      (r.calc.requiredMonthly ? `, needs RM ${Number(r.calc.requiredMonthly).toLocaleString()}/month` : '')
    : '';
  MailApp.sendEmail({
    to: to,
    subject: `🔔 New website lead: ${r.name} (${r.source})`,
    body:
      `Name: ${r.name}\nPhone: ${r.phone}\nWhatsApp: https://wa.me/${toIntlMy(r.phone || '')}\nEmail: ${r.email}\n` +
      `Wants consult: ${r.wantsConsult || ''}\nTopics: ${r.topics || ''}\nMeeting: ${r.meetingType || ''} / ${r.meetingLang || ''}\n` +
      `Message: ${r.message || ''}${calc}\n\nOpen the sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`
  });
}

function safe(s) {
  s = s.slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor to check everything works (adds a TEST row and sends you an email).
function testLead() {
  doPost({ postData: { contents: JSON.stringify({
    source: 'test', name: 'Test Lead', phone: '012-345 6789', email: 'test@example.com', wantsConsult: 'yes', consent: 'yes',
    calc: { currentAge: 35, retireAge: 60, lifeExp: 85, gap: -500000, requiredMonthly: 1800 }
  }) } });
}

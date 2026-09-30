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
  return ss.getSheetByName(SHEET_NAME) || setupSheet();
}

const STATUSES = ['New', 'Contacted', 'Booked', 'Met', 'Client', 'Not now'];

/**
 * ▶ RUN THIS ONCE from the editor. Builds and formats the "Leads" tab and a "Summary" tab.
 * Safe to run again: it never deletes lead rows.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Reuse the blank first tab ("Sheet1") if nothing is in it
    const first = ss.getSheets()[0];
    sheet = first.getLastRow() === 0 && first.getName() !== 'Summary' ? first.setName(SHEET_NAME) : ss.insertSheet(SHEET_NAME, 0);
  }
  const n = COLUMNS.length, col = h => COLUMNS.findIndex(([x]) => x === h) + 1;
  sheet.getRange(1, 1, 1, n).setValues([COLUMNS.map(([h]) => h)])
    .setFontWeight('bold').setBackground('#9A7B3E').setFontColor('#FFFFFF').setWrap(true).setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);
  sheet.setRowHeight(1, 36);
  if (sheet.getMaxColumns() > n) sheet.deleteColumns(n + 1, sheet.getMaxColumns() - n);

  const rows = sheet.getMaxRows() - 1;
  sheet.getRange(2, col('Received'), rows, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  ['Monthly spend (RM)', 'EPF balance', 'EPF monthly', 'Savings balance', 'Savings monthly', 'Needed at retirement',
   'Projected at retirement', 'Gap (-) / Surplus', 'Required monthly'].forEach(h =>
    sheet.getRange(2, col(h), rows, 1).setNumberFormat('"RM "#,##0;[Red]"-RM "#,##0'));

  const widths = { 'Received': 130, 'Source': 150, 'Name': 150, 'Phone': 120, 'WhatsApp link': 200, 'Email': 200,
                   'Topics': 180, 'Message': 260, 'Status': 110 };
  COLUMNS.forEach(([h], i) => sheet.setColumnWidth(i + 1, widths[h] || 110));

  // Status dropdown + colours
  const status = sheet.getRange(2, col('Status'), rows, 1);
  status.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());
  const colours = { 'New': '#FEF9EC', 'Contacted': '#EBF5FB', 'Booked': '#F0EDFD', 'Met': '#E8F8F5', 'Client': '#EDF7F1', 'Not now': '#F1F1F1' };
  const rules = Object.keys(colours).map(s => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(s).setBackground(colours[s]).setRanges([status]).build());
  // Highlight people who asked for a consultation
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('yes').setBold(true).setFontColor('#1A6B3C')
    .setRanges([sheet.getRange(2, col('Wants consult'), rows, 1)]).build());
  sheet.setConditionalFormatRules(rules);

  buildSummary(ss, col);
  SpreadsheetApp.flush();
  return sheet;
}

function buildSummary(ss, col) {
  let s = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  s.clear();
  const L = c => String.fromCharCode(64 + c); // column letter (fine for < 27 columns)
  const letter = h => { const i = col(h); return i <= 26 ? L(i) : 'A' + L(i - 26); };
  const R = `${SHEET_NAME}!${letter('Received')}2:${letter('Received')}`;
  const SRC = `${SHEET_NAME}!${letter('Source')}2:${letter('Source')}`;
  const ST = `${SHEET_NAME}!${letter('Status')}2:${letter('Status')}`;
  const WC = `${SHEET_NAME}!${letter('Wants consult')}2:${letter('Wants consult')}`;
  const GAP = `${SHEET_NAME}!${letter('Gap (-) / Surplus')}2:${letter('Gap (-) / Surplus')}`;
  const data = [
    ['Kelly Chan · Website Leads', ''],
    ['', ''],
    ['Total leads', `=COUNTA(${R})`],
    ['Last 7 days', `=COUNTIF(${R},">="&(TODAY()-7))`],
    ['This month', `=COUNTIFS(${R},">="&EOMONTH(TODAY(),-1)+1)`],
    ['From calculator', `=COUNTIF(${SRC},"calculator")`],
    ['From booking page', `=COUNTIF(${SRC},"booking*")`],
    ['Asked for a consultation', `=COUNTIF(${WC},"yes")`],
    ['Average retirement gap (calculator)', `=IFERROR(AVERAGEIF(${GAP},"<0"),0)`],
    ['', ''],
    ['Pipeline', 'Count']
  ].concat(STATUSES.map(x => [x, `=COUNTIF(${ST},"${x}")`]));
  s.getRange(1, 1, data.length, 2).setValues(data);
  s.getRange('A1').setFontSize(16).setFontWeight('bold').setFontColor('#9A7B3E');
  s.getRange('A11:B11').setFontWeight('bold').setBackground('#FBF7EE');
  s.getRange('B9').setNumberFormat('"RM "#,##0;[Red]"-RM "#,##0');
  s.getRange('B3:B8').setFontWeight('bold');
  s.setColumnWidth(1, 260); s.setColumnWidth(2, 120);
  ss.setActiveSheet(ss.getSheetByName(SHEET_NAME));
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

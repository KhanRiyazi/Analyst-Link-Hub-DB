/**
 * Analyst Link Hub: a free database in Google Sheets.
 *
 * Paste this whole file into Extensions > Apps Script of a Google Sheet,
 * then follow docs/SETUP.md. Your data lives in three tabs of that Sheet:
 *   Links, Decisions, Settings
 *
 * The web app is protected by a secret key kept in Script Properties.
 */

const SHEETS = {
  Links: ['id', 'title', 'url', 'stage', 'importance', 'due', 'minutes', 'pinned', 'opens', 'last', 'doneOn', 'reference', 'added', 'icon'],
  Decisions: ['id', 'date', 'decision', 'why'],
  Settings: ['key', 'value']
};
const MAX_LINKS = 5000;
const MAX_DECISIONS = 500;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const ss_ = () => SpreadsheetApp.getActiveSpreadsheet();
const props_ = () => PropertiesService.getScriptProperties();

/* ---------- Menu inside the Sheet ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Link Hub')
    .addItem('1. Set up sheets and secret key', 'setup')
    .addItem('Show my secret key', 'showKey')
    .addItem('Make a new secret key', 'newKey')
    .addToUi();
}

function setup() {
  ensureSheets_();
  if (!props_().getProperty('API_KEY')) newKey_();
  showKey();
}

function newKey() { newKey_(); showKey(); }

function newKey_() {
  props_().setProperty('API_KEY', (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''));
}

function showKey() {
  const key = props_().getProperty('API_KEY') || '(none yet: run "Set up sheets and secret key" first)';
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('Your secret key', key + '\n\nPaste it into the Sync box of your Link Hub.\nDo not share it and do not put it on GitHub.', ui.ButtonSet.OK);
  } catch (e) {
    Logger.log('Secret key: ' + key);
  }
}

/* ---------- Web app ---------- */

function doGet() {
  return json_({ ok: true, service: 'Analyst Link Hub API', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const body = (e && e.postData && e.postData.contents) || '';
    if (body.length > 4000000) return json_({ ok: false, error: 'Request is too large' });
    const req = JSON.parse(body);
    if (!authOk_(req.key)) { Utilities.sleep(500); return json_({ ok: false, error: 'Wrong or missing secret key' }); }

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) return json_({ ok: false, error: 'The Sheet is busy. Try again.' });
    try {
      ensureSheets_();
      if (req.action === 'ping') return json_({ ok: true, links: Math.max(ss_().getSheetByName('Links').getLastRow() - 1, 0) });
      if (req.action === 'load') return json_(Object.assign({ ok: true }, readAll_()));
      if (req.action === 'save') { writeAll_(req.data); return json_({ ok: true, saved: new Date().toISOString() }); }
      return json_({ ok: false, error: 'Unknown action' });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function authOk_(key) {
  const real = props_().getProperty('API_KEY');
  return !!real && typeof key === 'string' && key.length === real.length && key === real;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Sheets setup ---------- */

function ensureSheets_() {
  const ss = ss_();
  Object.keys(SHEETS).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const cols = SHEETS[name].length;
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, cols).setValues([SHEETS[name]]).setFontWeight('bold');
      sh.setFrozenRows(1);
      // Plain text everywhere, so text such as =SUM(...) is never run as a formula.
      sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), cols).setNumberFormat('@');
    }
  });
  const blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
}

/* ---------- Helpers ---------- */

const s_ = function (v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
};
const clip_ = function (v, n) { return s_(v).slice(0, n); };
const num_ = function (v) { const n = Number(v); return isFinite(n) ? n : 0; };
const bool_ = function (v) { return v === true || s_(v).toLowerCase() === 'true' ? 'true' : 'false'; };
const date_ = function (v) { return DATE_RE.test(s_(v)) ? s_(v) : ''; };
const url_ = function (v) { return /^https?:\/\//i.test(s_(v)) ? clip_(v, 2000) : ''; };

function readRows_(name) {
  const sh = ss_().getSheetByName(name);
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, SHEETS[name].length).getValues().map(function (r) { return r.map(s_); });
}

function parseJson_(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) { return null; }
}

function readAll_() {
  const links = readRows_('Links').map(function (r) {
    return {
      id: num_(r[0]), title: r[1], url: r[2], cat: r[3], pri: num_(r[4]), due: date_(r[5]),
      mins: num_(r[6]) || 15, pinned: bool_(r[7]) === 'true', opens: num_(r[8]), last: num_(r[9]),
      doneOn: date_(r[10]), ref: bool_(r[11]) === 'true', added: num_(r[12]), icon: parseJson_(r[13])
    };
  }).filter(function (l) { return l.id && l.url; });

  const decisions = readRows_('Decisions').map(function (r) {
    return { id: num_(r[0]), date: r[1], t: r[2], why: r[3] };
  }).filter(function (d) { return d.id && d.t; });

  const settings = {};
  readRows_('Settings').forEach(function (r) { settings[r[0]] = r[1]; });
  return {
    links: links,
    decisions: decisions,
    settings: { review: date_(settings.review), domain: settings.domain || '', apps: parseJson_(settings.apps) }
  };
}

function replace_(name, rows) {
  const sh = ss_().getSheetByName(name);
  const cols = SHEETS[name].length;
  const old = sh.getLastRow() - 1;
  if (old > 0) sh.getRange(2, 1, old, cols).clearContent();
  if (!rows.length) return;
  const need = rows.length + 1;
  if (sh.getMaxRows() < need) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
  const range = sh.getRange(2, 1, rows.length, cols);
  range.setNumberFormat('@');
  range.setValues(rows.map(function (r) { return r.map(s_); }));
}

function writeAll_(d) {
  if (!d || !Array.isArray(d.links)) throw new Error('No links list in the request');
  const links = d.links.slice(0, MAX_LINKS).filter(function (l) { return l && url_(l.url); }).map(function (l) {
    const icon = l.icon ? JSON.stringify(l.icon) : '';
    return [num_(l.id), clip_(l.title, 300), url_(l.url), clip_(l.cat, 30), num_(l.pri), date_(l.due), num_(l.mins) || 15,
      bool_(l.pinned), num_(l.opens), num_(l.last), date_(l.doneOn), bool_(l.ref), num_(l.added), icon.length <= 45000 ? icon : ''];
  });

  const existing = Math.max(ss_().getSheetByName('Links').getLastRow() - 1, 0);
  if (links.length === 0 && existing > 0 && !d.confirmEmpty) {
    throw new Error('Refusing to replace your data with an empty list. Use Save to Sheet and confirm.');
  }

  const decisions = (Array.isArray(d.decisions) ? d.decisions : []).slice(0, MAX_DECISIONS).filter(function (x) { return x && x.t; }).map(function (x) {
    return [num_(x.id), date_(x.date), clip_(x.t, 1000), clip_(x.why, 1000)];
  });

  const st = d.settings || {};
  const apps = Array.isArray(st.apps) ? st.apps.slice(0, 12).map(function (a) { return { n: clip_(a && a.n, 40), u: clip_(a && a.u, 2000) }; }) : null;
  const settings = [['review', date_(st.review)], ['domain', clip_(st.domain, 100)], ['apps', apps ? JSON.stringify(apps) : '']];

  replace_('Links', links);
  replace_('Decisions', decisions);
  replace_('Settings', settings);
}

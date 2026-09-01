/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  WHERE HIS ANSWERS LAND.                                             ║
 * ║                                                                      ║
 * ║  Setup, once, about 10 minutes — full walkthrough in DEPLOY.md:      ║
 * ║                                                                      ║
 * ║   1. Make a new Google Sheet. Call it anything.                      ║
 * ║   2. Extensions → Apps Script. Delete what's there, paste this.      ║
 * ║   3. Change VAULT_PASSCODE and NOTIFY_EMAIL below.                   ║
 * ║   4. Deploy → New deployment → type "Web app"                        ║
 * ║        Execute as:      Me                                           ║
 * ║        Who has access:  Anyone            ← must be "Anyone"         ║
 * ║   5. Copy the /exec URL into src/content/config.ts → appsScriptUrl   ║
 * ║   6. Open yoursite.com/?selftest=1 and confirm you see green.        ║
 * ║                                                                      ║
 * ║  "Anyone" only means anyone can POST an answer. Reading requires     ║
 * ║  the passcode, which never appears anywhere in the website's code.   ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────── EDIT THESE ──
var VAULT_PASSCODE = 'vault';             // you type this at /#/vault  ← worth making harder
var NOTIFY_EMAIL   = 'rmkannan2005@gmail.com';  // '' for no emails
var HIS_NAME       = 'Sakthi';            // just for the email subject lines

/**
 * Leave empty if you created this script from inside your Sheet
 * (Extensions → Apps Script) — it finds the Sheet on its own.
 *
 * If you made a standalone project instead (New project at
 * script.google.com), there IS no "active" spreadsheet and every write
 * fails. Paste your Sheet's id here and it works either way.
 *
 * The id is the long string in the Sheet's own URL:
 *   docs.google.com/spreadsheets/d/1a2B3c...XyZ/edit
 *                                  └──── this ────┘
 */
var SHEET_ID = '1qAXokhcIL7sv6JUNSbifl626p3Ho1lt8KU8TYkiFfcw';
// ─────────────────────────────────────────────────────────────────────────

var ANSWERS_SHEET = 'Answers';
var EVENTS_SHEET  = 'Events';

var ANSWER_HEADERS = [
  'Received', 'Answered At', 'Session', 'Chat', 'Question ID',
  'Question', 'Answer', 'Correct', 'Seconds Taken', 'Device'
];

/* ══════════════════════════════════════════════════════════ receiving ══ */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var batch = body.batch || [];
    var wroteAnswer = false;

    for (var i = 0; i < batch.length; i++) {
      var env = batch[i];
      if (env.kind === 'answer') {
        upsertAnswer(env.payload);
        wroteAnswer = true;
      } else if (env.kind === 'event') {
        appendEvent(env.payload);
        maybeNotify(env.payload);
      }
    }

    if (wroteAnswer) touchDigest();
    return reply({ status: 'ok', received: batch.length });
  } catch (err) {
    // Never throw. A 500 makes the site retry forever; logging keeps the
    // failure visible to you without breaking his experience.
    logFailure(err, e && e.postData ? e.postData.contents : '');
    return reply({ status: 'error', message: String(err) });
  }
}

/**
 * Upsert, not append. Retries and the sendBeacon-on-close path can deliver
 * the same answer more than once — keyed on session + question, a repeat
 * overwrites its own row instead of littering the sheet with duplicates.
 */
function upsertAnswer(a) {
  var sheet = sheetNamed(ANSWERS_SHEET, ANSWER_HEADERS);
  var key = a.sessionId + '|' + a.questionId;

  var lastRow = sheet.getLastRow();
  var targetRow = -1;
  if (lastRow > 1) {
    var keys = sheet.getRange(2, 3, lastRow - 1, 3).getValues(); // Session, Chat, Question ID
    for (var r = 0; r < keys.length; r++) {
      if (keys[r][0] + '|' + keys[r][2] === key) { targetRow = r + 2; break; }
    }
  }

  var row = [
    new Date(),
    a.answeredAt || '',
    a.sessionId || '',
    a.sessionCode || '',
    a.questionId || '',
    a.question || '',
    a.value === '' || a.value == null ? '(left blank)' : a.value,
    a.correct === null || a.correct === undefined ? '' : (a.correct ? 'yes' : 'no'),
    a.secondsTaken || 0,
    a.device || ''
  ];

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function appendEvent(ev) {
  var sheet = sheetNamed(EVENTS_SHEET, ['Received', 'At', 'Session', 'Event', 'Detail']);
  sheet.appendRow([new Date(), ev.at || '', ev.sessionId || '', ev.event || '', ev.detail || '']);
}

/* ═══════════════════════════════════════════════════════════ emailing ══ */

/** Pings you the moment he opens it, and again when he finishes. */
function maybeNotify(ev) {
  if (!NOTIFY_EMAIL) return;
  var subject = null, body = '';

  if (ev.event === 'opened') {
    subject = HIS_NAME + ' just opened it. 👀';
    body = 'He started at ' + ev.at + '.\n\n' + vaultHint();
  } else if (ev.event === 'finished') {
    subject = HIS_NAME + ' finished it. ❤️';
    body = 'He reached the end at ' + ev.at + '.\n' +
           (ev.detail ? 'Score: ' + ev.detail + '\n' : '') +
           '\n' + vaultHint();
  } else if (ev.event === 'selftest') {
    subject = 'Storage self-test passed ✅';
    body = 'Your answer pipeline is working. Nothing to do.\n\n' + vaultHint();
  }

  if (subject) {
    try { MailApp.sendEmail(NOTIFY_EMAIL, subject, body); } catch (err) { /* quota */ }
  }
}

function vaultHint() {
  var url = '(sheet not reachable)';
  try { url = book().getUrl(); } catch (err) { /* leave the placeholder */ }
  return 'Read everything he wrote at: yoursite.com/#/vault\n' +
         'Or open this spreadsheet: ' + url;
}

/** Debounced "he answered something" nudge — at most one per 10 minutes. */
function touchDigest() {
  if (!NOTIFY_EMAIL) return;
  var props = PropertiesService.getScriptProperties();
  var last = Number(props.getProperty('lastDigest') || 0);
  var now = Date.now();
  if (now - last < 10 * 60 * 1000) return;
  props.setProperty('lastDigest', String(now));
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, HIS_NAME + ' is answering your questions right now 👀', vaultHint());
  } catch (err) { /* quota */ }
}

/* ═══════════════════════════════════════════════════ reading (the Vault) ══ */

/**
 * The website's /#/vault page calls this with the passcode you type in.
 * The passcode is never shipped inside the site, so nobody who inspects
 * the page source can pull his answers out.
 */
function doGet(e) {
  var params = e.parameter || {};

  /**
   * The self-test calls this. It deliberately reports whether a spreadsheet
   * is actually reachable, because "the deployment responds" and "the script
   * can write" are two different things — and the usual mistake (creating a
   * standalone script instead of one bound to a Sheet) passes the first and
   * fails the second.
   */
  if (params.action === 'ping') {
    var bound = false;
    var detail = '';
    try {
      detail = book().getName();
      bound = true;
    } catch (err) {
      detail = String(err);
    }
    return reply({ status: 'ok', alive: true, sheetBound: bound, sheetName: detail });
  }

  if (params.action === 'read') {
    if (params.key !== VAULT_PASSCODE) {
      Utilities.sleep(600); // take the fun out of guessing
      return reply({ status: 'denied' });
    }
    return reply({ status: 'ok', answers: readAnswers(), events: readEvents() });
  }

  return reply({ status: 'ok', hint: 'nothing to see here 👀' });
}

function readAnswers() {
  var sheet = sheetNamed(ANSWERS_SHEET, ANSWER_HEADERS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, ANSWER_HEADERS.length).getValues();
  return values.map(function (r) {
    return {
      receivedAt: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      answeredAt: String(r[1]),
      sessionId: String(r[2]),
      sessionCode: String(r[3]),
      questionId: String(r[4]),
      question: String(r[5]),
      value: String(r[6]),
      correct: r[7] === 'yes' ? true : r[7] === 'no' ? false : null,
      secondsTaken: Number(r[8]) || 0,
      device: String(r[9])
    };
  });
}

function readEvents() {
  var sheet = sheetNamed(EVENTS_SHEET, ['Received', 'At', 'Session', 'Event', 'Detail']);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, 5).getValues().map(function (r) {
    return { at: String(r[1]), sessionId: String(r[2]), event: String(r[3]), detail: String(r[4]) };
  });
}

/* ═════════════════════════════════════════════════════════════ plumbing ══ */

/**
 * The one place that decides which spreadsheet we're writing to.
 * Explicit id wins; otherwise the Sheet this script is bound to.
 */
function book() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No spreadsheet found. This script is standalone — set SHEET_ID at the ' +
      'top of this file to your Sheet id, then re-deploy as a new version.'
    );
  }
  return ss;
}

function sheetNamed(name, headers) {
  var ss = book();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function reply(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function logFailure(err, raw) {
  try {
    var sheet = sheetNamed('Errors', ['When', 'Error', 'Payload']);
    sheet.appendRow([new Date(), String(err), String(raw).slice(0, 5000)]);
  } catch (ignored) { /* nothing left to try */ }
}

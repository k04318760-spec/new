# Getting it online, and getting his answers back

Two jobs. Do the answers one **first** — finding out afterwards that nothing
was being saved is the only mistake here you can't undo.

---

# Part 1 — Where his answers go

## What you'll end up with

| Where | What you see |
|---|---|
| **The Vault** — `yoursite.com/#/vault` | The whole conversation replayed: her question, his reply, how long he hesitated on each one |
| **Your email** | A ping the moment he opens it, and again when he finishes |
| **A Google Sheet** | One row per answer. Your backup, always there |

## Setup — about ten minutes

**1.** Make a new Google Sheet. Call it anything.

**2.** `Extensions → Apps Script`. Delete whatever's in the editor.

**3.** Open `apps-script/Code.gs` from this project, copy all of it, paste it in.

**4.** Change the three lines at the top:

```js
var VAULT_PASSCODE = 'something-only-you-know';
var NOTIFY_EMAIL   = 'you@example.com';     // '' for no emails
var HIS_NAME       = 'his name';            // just for email subjects
```

**5.** Save (💾), then `Deploy → New deployment`.

- Click the gear next to "Select type" → **Web app**
- **Execute as:** Me
- **Who has access:** **Anyone** ← this must say Anyone

**6.** Authorise it. Google will warn you the app is unverified — it's your own
script, so click *Advanced* → *Go to (project name)*.

**7.** Copy the **Web app URL**. It ends in `/exec`. Paste it into
`src/content/config.ts`:

```ts
storage: {
  appsScriptUrl: 'https://script.google.com/macros/s/AKfy.../exec',
  whatsappNumber: '919876543210',   // yours, international, no +
}
```

**8.** Verify it. Run `npm run dev`, open `localhost:5173/?selftest=1`.

You want every row green. A TEST row should appear in your sheet within a few
seconds. Delete that row afterwards.

> **"Who has access: Anyone" sounds alarming.** It only means anyone can *send*
> an answer. Reading requires the passcode, which is never compiled into the
> website — you type it into the Vault, and the script refuses to return a
> single row without it.

## Optional second channel

Belt and braces. Sign up at [web3forms.com](https://web3forms.com) (free, no
account needed — it just emails you an access key) and add:

```ts
backupFormUrl: 'https://api.web3forms.com/submit',
```

Both channels fire independently for every answer. If either one lands, you
have it.

## What happens when things go wrong

You don't have to trust the happy path — the site doesn't:

- **He closes the tab mid-question.** Every answer is written to his device the
  instant he sends it, and pushed to your sheet immediately — never batched up
  and posted at the end.
- **His signal drops.** Failed sends queue up and retry on reconnect, on tab
  focus, on a timer, and on his next visit.
- **He closes the tab while a send is in flight.** The queue goes out via
  `sendBeacon`, which survives page unload. A normal request wouldn't.
- **Something sends twice.** Every write is keyed on session + question, so a
  retry overwrites its own row instead of duplicating it.
- **Everything above fails.** The last screen offers him a "send her your
  answers 💌" button that opens WhatsApp prefilled with everything he wrote.
  No server involved at all.

---

# Part 2 — Putting the site online

## Netlify, the no-account-needed way

```bash
npm run build
```

Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** and drag the
`dist` folder onto the page.

That's it. You get a live URL in about thirty seconds.

To update it later: `npm run build` again, drag `dist` again.

## Which host

| Host | Why / why not |
|---|---|
| **Netlify** | Drag-and-drop, no Git needed. Use this. |
| Vercel | Just as good, slightly more setup. |
| Cloudflare Pages | 25 MB per-file cap — your videos will hit it. |
| GitHub Pages | Repo is public unless you pay. Your photos would be findable. **Don't.** |

## Size budget

Aim for **under 150 MB total**. Check with:

```bash
du -sh dist
```

If you're over, it's almost always videos. Re-run `npm run optimize:vid`, or
cut a long clip shorter.

## The link preview

When you send the link on WhatsApp, a preview card appears. This one
deliberately says **"open this. 👀"** and nothing else — a preview reading
"Happy Birthday!" would spoil the whole thing before he taps.

It's set in `index.html`. Don't make it descriptive.

## A note on privacy, honestly

The passphrase gate is **client-side only**. It stops a curious stranger who
stumbles on the link. It does not stop anyone technical who views the page
source.

For photos of two people hanging out, an unlisted URL plus the gate is
genuinely fine. If any photo is one you'd be upset about existing on a public
URL, leave it out of the site and show him in person instead.

Real password protection costs $19/month on Netlify, and Cloudflare Access
(free) forces an email login that would wreck the surprise. Neither is worth it
here — just choose the photos knowingly.

---

# Part 3 — Before you send it

Test on an actual phone, not just a narrow browser window.

- [ ] `?selftest=1` all green
- [ ] The whole journey, start to finish, on your phone, with sound on
- [ ] The gate accepts the nickname
- [ ] A video plays and the music ducks under it
- [ ] Answer a question, then check `#/vault` — it's there
- [ ] No sideways scrolling anywhere
- [ ] The WhatsApp link preview gives nothing away

**iPhone note:** the physical silent switch mutes web audio. If it seems
silent, that's the switch, not the site. Worth mentioning when you send it —
*"headphones, and turn your ringer on"* works as a hint without spoiling
anything.

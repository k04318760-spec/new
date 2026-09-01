/**
 * Drives the real site in a real browser, start to finish, and fails loudly
 * on anything a visitor would notice: a console error, a blank screen, a
 * page that scrolls sideways, or an answer that never reaches storage.
 *
 *   node scripts/smoke.mjs [url]
 *
 * Not a unit test — it clicks the buttons he'll click.
 */
import { chromium, devices } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'

const BASE = process.argv[2] || 'http://localhost:5174'
const SHOTS = 'scratch/shots'

/**
 * Read the real passphrase out of config.ts rather than hardcoding one.
 * Otherwise every time she changes the nickname, the smoke test starts
 * failing at the front door for no reason at all.
 */
const configSource = await readFile('src/content/config.ts', 'utf-8')
const acceptMatch = configSource.match(/accept:\s*\[\s*(['"])(.*?)\1/)
const PASSPHRASE = acceptMatch ? acceptMatch[2] : '[NICKNAME]'
const gateEnabled = !/enabled:\s*false/.test(configSource.split('gate:')[1]?.slice(0, 200) ?? '')

const errors = []
const problems = []

await mkdir(SHOTS, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  ...devices['iPhone 13'],
  // Cuts every animation delay so a 10-minute journey runs in seconds.
  reducedMotion: 'reduce',
})
const page = await context.newPage()

page.on('console', (msg) => {
  if (msg.type() === 'error') {
    const text = msg.text()
    // A missing placeholder photo/song is expected before she adds hers.
    if (/Failed to load resource|net::ERR|404|favicon/i.test(text)) return
    errors.push(text)
  }
})
page.on('pageerror', (err) => errors.push(`UNCAUGHT: ${err.message}`))

const shot = async (name) => {
  await page.screenshot({ path: `${SHOTS}/${name}.png` })
}

/** Nothing on the site may ever scroll sideways. */
async function checkNoOverflow(where) {
  const overflow = await page.evaluate(() => {
    const d = document.documentElement
    return { scroll: d.scrollWidth, client: d.clientWidth }
  })
  if (overflow.scroll > overflow.client + 1) {
    problems.push(`horizontal overflow at ${where}: ${overflow.scroll}px in ${overflow.client}px`)
  }
}

/** A screen with almost no text on it is a crash wearing a costume. */
async function checkNotBlank(where, min = 3) {
  const text = (await page.locator('body').innerText()).trim()
  if (text.length < min) problems.push(`blank screen at ${where}`)
  return text
}

const step = async (name, fn) => {
  process.stdout.write(`  ${name} ... `)
  try {
    await fn()
    await checkNoOverflow(name)
    await shot(name)
    console.log('ok')
  } catch (err) {
    console.log('FAILED')
    problems.push(`${name}: ${err.message}`)
    await shot(`${name}-FAILED`)
  }
}

console.log(`\nDriving ${BASE} as an iPhone 13\n`)

/* ── the door ─────────────────────────────────────────────────────────── */
await step('01-gate', async () => {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await checkNotBlank('gate')
  if (!gateEnabled) return

  await page.locator('#gate-answer').fill(PASSPHRASE)
  await page.getByRole('button', { name: /open it|let me in/i }).click()

  // Assert it actually opened. Without this the run limps on and every
  // later step fails with a confusing timeout instead of the real reason.
  await page.waitForFunction(
    () => !document.querySelector('#gate-answer'),
    undefined,
    { timeout: 15000 }
  ).catch(() => {
    throw new Error(`passphrase "${PASSPHRASE}" was rejected — check config.gate.accept`)
  })
})

/* ── the opening ──────────────────────────────────────────────────────── */
await step('02-intro', async () => {
  const start = page.getByRole('button', { name: /Start Your Surprise/i })
  await start.waitFor({ timeout: 15000 })
  await start.click()
})

/**
 * The way out of a photo chapter is at the very bottom, on purpose — he gets
 * there by actually looking at the photos. So scroll first, then click.
 */
async function scrollToEndAndClick(name) {
  const cta = page.getByRole('button', { name })
  await cta.waitFor({ state: 'attached', timeout: 20000 })
  for (let i = 0; i < 12; i++) {
    if (await cta.isVisible().catch(() => false)) break
    await page.mouse.wheel(0, 2500)
    await page.waitForTimeout(220)
  }
  await cta.scrollIntoViewIfNeeded()
  await cta.click()
}

/* ── chapter 1 ────────────────────────────────────────────────────────── */
await step('03-beginning', () => scrollToEndAndClick(/keep going/i))

/* ── chapter 2 ────────────────────────────────────────────────────────── */
await step('04-chaos', () => scrollToEndAndClick(/okay stop/i))

/* ── the conversation — the part that must store answers ──────────────── */
await step('05-chat-01', async () => {
  // Answer whatever it offers until the session hands over to the next scene.
  for (let i = 0; i < 12; i++) {
    const choice = page.locator('button.tap-target:not([aria-label*="Send"]):not([disabled])').first()
    const textbox = page.getByRole('textbox', { name: /your answer/i })

    if (await textbox.isVisible().catch(() => false)) {
      await textbox.fill('a test answer from the smoke run')
      await page.getByRole('button', { name: /send your answer/i }).click()
    } else if (await choice.isVisible().catch(() => false)) {
      await choice.click()
    } else {
      await page.waitForTimeout(900)
      continue
    }
    await page.waitForTimeout(400)
  }
})

await step('06-answers-stored', async () => {
  const stored = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('bd.answers') || '[]')
    } catch {
      return []
    }
  })
  if (!stored.length) throw new Error('no answers written to localStorage')
  console.log(`\n      ${stored.length} answers stored locally:`)
  for (const a of stored) {
    console.log(`        ${a.questionId} → "${String(a.value).slice(0, 40)}" (${a.secondsTaken}s)`)
  }
  process.stdout.write('      ')
})

/* ── every dev jump, asserting we actually landed on that scene ───────── */

/**
 * "The page has some text on it" is not good enough: when a jump silently
 * failed, the gate was still on screen and it has plenty of text. Each scene
 * has to prove itself with something only it renders.
 */
const SCENE_MARKERS = {
  beginning: /it started somewhere/i,
  chaos: /the chaos/i,
  moments: /the moments that matter/i,
  unsaid: /things I may not always say/i,
  videos: /some memories\s+needed to move|MEMORY_01/i,
  letters: /did you think that was everything|wrote you some letters/i,
  montage: /one more thing|Play it/i,
  // The fake ending moves through four phases on its own — the opening
  // lines, the credit roll, a beat of black, then the interruption. Any of
  // them proves we landed; pinning it to the first is a race we lose.
  credits: /that.s everything|Every photo|DIRECTED BY|PROJECT:|did you really think|BIRTHDAY WISH/i,
  finale: /HAPPY BIRTHDAY/i,
}

for (const [at, marker] of Object.entries(SCENE_MARKERS)) {
  await step(`07-${at}`, async () => {
    await page.goto(`${BASE}/?dev=1&at=${at}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const text = await checkNotBlank(at, 2)
    if (!marker.test(text)) {
      const stuck = /BEFORE I LET YOU IN/i.test(text) ? ' (stuck on the gate)' : ''
      throw new Error(`jumped to "${at}" but that scene never rendered${stuck}`)
    }
  })
}

/* ── the montage actually running ─────────────────────────────────────── */
await step('08-montage-playing', async () => {
  await page.goto(`${BASE}/?dev=1&at=montage`, { waitUntil: 'networkidle' })
  const play = page.getByRole('button', { name: /Play it/i })
  await play.waitFor({ timeout: 10000 })
  await play.click()
  await page.waitForTimeout(3000)
})

/* ── the vault, on a desktop viewport ─────────────────────────────────── */
await step('09-vault', async () => {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const vp = await desktop.newPage()
  vp.on('pageerror', (err) => errors.push(`VAULT UNCAUGHT: ${err.message}`))
  await vp.goto(`${BASE}/#/vault`, { waitUntil: 'networkidle' })
  await vp.getByLabel(/passcode/i).fill('test')
  await vp.getByRole('button', { name: /^open$/i }).click()
  await vp.waitForTimeout(1500)
  await vp.screenshot({ path: `${SHOTS}/09-vault.png`, fullPage: true })
  await desktop.close()
})

/* ── desktop pass over the visual chapters ────────────────────────────── */
await step('10-desktop', async () => {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const dp = await desktop.newPage()
  dp.on('pageerror', (err) => errors.push(`DESKTOP UNCAUGHT: ${err.message}`))
  await dp.goto(`${BASE}/?dev=1&at=chaos`, { waitUntil: 'networkidle' })
  await dp.waitForTimeout(1500)
  await dp.screenshot({ path: `${SHOTS}/10-desktop-chaos.png` })
  const o = await dp.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }))
  if (o.scroll > o.client + 1) problems.push(`desktop overflow: ${o.scroll} > ${o.client}`)
  await desktop.close()
})

await browser.close()

/* ── verdict ──────────────────────────────────────────────────────────── */
console.log('\n' + '─'.repeat(60))
if (errors.length) {
  console.log(`\n  ${errors.length} console error(s):\n`)
  ;[...new Set(errors)].forEach((e) => console.log(`    · ${e}`))
}
if (problems.length) {
  console.log(`\n  ${problems.length} problem(s):\n`)
  problems.forEach((p) => console.log(`    · ${p}`))
}
if (!errors.length && !problems.length) {
  console.log('\n  Clean. No console errors, no blank screens, no overflow.\n')
}
console.log(`  Screenshots in ${SHOTS}/\n`)
process.exit(errors.length || problems.length ? 1 : 0)

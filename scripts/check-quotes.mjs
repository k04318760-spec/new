/**
 * Confirms every quote in quotes.ts actually appears somewhere in the
 * experience, and flags any that got used twice.
 *
 *   npm run check:quotes
 *
 * Worth running after you move quotes around — it is very easy to delete the
 * last reference to a line you meant to keep.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const keys = [...readFileSync('src/content/quotes.ts', 'utf-8').matchAll(/^ {2}([a-zA-Z]+):/gm)].map(
  (m) => m[1]
)

/** Every source file except quotes.ts itself. */
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry) && !full.endsWith('quotes.ts')) acc.push(full)
  }
  return acc
}

const files = walk('src')
const where = Object.fromEntries(keys.map((k) => [k, []]))

for (const file of files) {
  const text = readFileSync(file, 'utf-8')
  for (const key of keys) {
    if (new RegExp(`q\\.${key}\\b`).test(text)) where[key].push(path.basename(file))
  }
}

const unused = keys.filter((k) => where[k].length === 0)
const repeated = keys.filter((k) => where[k].length > 1)

console.log(`\n  ${keys.length} quotes · ${keys.length - unused.length} placed\n`)

const byFile = {}
for (const [key, list] of Object.entries(where)) {
  for (const f of list) (byFile[f] ??= []).push(key)
}
for (const [file, ks] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`    ${file.padEnd(16)} ${String(ks.length).padStart(2)}`)
}

if (unused.length) {
  console.log(`\n  NOT PLACED ANYWHERE (${unused.length}):`)
  unused.forEach((k) => console.log(`    · ${k}`))
}
if (repeated.length) {
  console.log(`\n  appears in more than one file (fine, but check it's deliberate):`)
  repeated.forEach((k) => console.log(`    · ${k} → ${where[k].join(', ')}`))
}
if (!unused.length) console.log('\n  Every line you wrote is in there somewhere.\n')

process.exit(unused.length ? 1 : 0)

/**
 * Builds numbered contact sheets from a folder of photos so they can be
 * reviewed a dozen at a time instead of one by one.
 *
 *   node scripts/contact-sheets.mjs S
 *
 * Also writes an index.json mapping every grid position back to its original
 * filename, which is what the placement step reads.
 */
import { readdir, stat, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)
const HEIC_CACHE = 'scratch/heic'

/**
 * sharp can read HEIC metadata but not decode it on most Windows builds —
 * the HEVC decoder is licence-encumbered and ships disabled. ffmpeg has it,
 * so iPhone photos take a detour through a cached JPEG.
 */
async function decodable(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext !== '.heic' && ext !== '.heif') return file

  await mkdir(HEIC_CACHE, { recursive: true })
  const cached = path.join(HEIC_CACHE, `${path.basename(file, ext)}.jpg`)
  if (existsSync(cached)) return cached

  await run('ffmpeg', ['-y', '-i', file, '-frames:v', '1', '-update', '1', '-q:v', '2', cached])
  return cached
}

const SOURCE = process.argv[2] || 'S'
const OUT = 'scratch/sheets'

const PHOTO_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'])
const COLS = 4
const ROWS = 3
const CELL = 300
const PER_SHEET = COLS * ROWS

/** Pulls a real date out of the filename; anything implausible is ignored. */
function dateFromName(name) {
  for (const m of name.matchAll(/(20\d{2})[-_]?(\d{2})[-_]?(\d{2})/g)) {
    const [, y, mo, d] = m
    const year = +y, month = +mo, day = +d
    if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${mo}-${d}`
    }
  }
  return null
}

await mkdir(OUT, { recursive: true })

const entries = (await readdir(SOURCE, { withFileTypes: true }))
  .filter((e) => e.isFile() && PHOTO_EXT.has(path.extname(e.name).toLowerCase()))
  .map((e) => e.name)

const withDates = await Promise.all(
  entries.map(async (name) => {
    const full = path.join(SOURCE, name)
    const fromName = dateFromName(name)
    const st = await stat(full)
    return {
      name,
      full,
      date: fromName ?? st.mtime.toISOString().slice(0, 10),
      dated: !!fromName,
    }
  })
)

withDates.sort((a, b) => (a.date === b.date ? a.name.localeCompare(b.name) : a.date.localeCompare(b.date)))

const index = withDates.map((p, i) => ({
  n: i + 1,
  sheet: Math.floor(i / PER_SHEET) + 1,
  cell: (i % PER_SHEET) + 1,
  name: p.name,
  date: p.date,
  dated: p.dated,
}))

await writeFile(`${OUT}/index.json`, JSON.stringify(index, null, 2))

const sheetCount = Math.ceil(withDates.length / PER_SHEET)
console.log(`\n${withDates.length} photos → ${sheetCount} sheets\n`)

for (let s = 0; s < sheetCount; s++) {
  const batch = withDates.slice(s * PER_SHEET, (s + 1) * PER_SHEET)

  const cells = []
  for (const [i, p] of batch.entries()) {
    try {
      const source = await decodable(p.full)
      const buf = await sharp(source).rotate().resize(CELL, CELL, { fit: 'cover' }).toBuffer()
      cells.push({ input: buf, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL })
    } catch (err) {
      // One unreadable file must not cost us the other seventy-three.
      console.log(`    ! skipped ${p.name}: ${String(err.message).split('\n')[0]}`)
    }
  }

  const out = `${OUT}/sheet-${s + 1}.jpg`
  await sharp({
    create: {
      width: COLS * CELL,
      height: ROWS * CELL,
      channels: 3,
      background: { r: 10, g: 9, b: 8 },
    },
  })
    .composite(cells)
    .jpeg({ quality: 78 })
    .toFile(out)

  const first = batch[0].n ?? s * PER_SHEET + 1
  console.log(`  sheet ${s + 1}: photos ${s * PER_SHEET + 1}–${s * PER_SHEET + batch.length}  (${batch[0].date} → ${batch[batch.length - 1].date})`)
}

console.log(`\nGrid order is left→right, top→bottom. Index in ${OUT}/index.json\n`)

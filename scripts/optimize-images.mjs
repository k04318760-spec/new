/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  npm run optimize:img                                                ║
 * ║                                                                      ║
 * ║  Drop your photos straight off your phone into assets-raw/images/,   ║
 * ║  keeping the same folder names as public/images/. Run this once.     ║
 * ║                                                                      ║
 * ║    assets-raw/images/intro/beginning-01.jpg   (4.2 MB)               ║
 * ║           ↓                                                          ║
 * ║    public/images/intro/beginning-01-640.webp   (48 KB)               ║
 * ║    public/images/intro/beginning-01-1080.webp  (121 KB)              ║
 * ║    public/images/intro/beginning-01-1600.webp  (238 KB)              ║
 * ║                                                                      ║
 * ║  Without this, thirty-five phone photos is roughly 150 MB and the    ║
 * ║  site is unusable on mobile data. With it, the whole thing is        ║
 * ║  smaller than a single unedited photo.                               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE = 'assets-raw/images'
const OUTPUT = 'public/images'
const WIDTHS = [640, 1080, 1600]
const QUALITY = 82
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif'])

let converted = 0
let skipped = 0
let bytesIn = 0
let bytesOut = 0

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(full)
      continue
    }
    if (!EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue
    await convert(full)
  }
}

async function convert(file) {
  const relative = path.relative(SOURCE, file)
  const outDir = path.join(OUTPUT, path.dirname(relative))
  const base = path.basename(file, path.extname(file))

  await mkdir(outDir, { recursive: true })

  const source = await stat(file)
  const newest = Math.max(
    ...(await Promise.all(
      WIDTHS.map(async (w) => {
        const out = path.join(outDir, `${base}-${w}.webp`)
        if (!existsSync(out)) return 0
        return (await stat(out)).mtimeMs
      })
    ))
  )

  // Already done and nothing has changed — leave it alone.
  if (newest > source.mtimeMs) {
    skipped++
    return
  }

  bytesIn += source.size
  const image = sharp(file).rotate() // honours the phone's EXIF orientation
  const meta = await image.metadata()

  for (const width of WIDTHS) {
    const out = path.join(outDir, `${base}-${width}.webp`)
    // Never upscale — a 900px original stays 900px.
    const target = meta.width && meta.width < width ? meta.width : width
    const info = await image
      .clone()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(out)
    bytesOut += info.size
  }

  converted++
  process.stdout.write(`  ✓ ${relative}\n`)
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`

if (!existsSync(SOURCE)) {
  console.log(`\nNothing to do — ${SOURCE}/ doesn't exist yet.`)
  console.log(`Create it, drop your photos in (same folder names as public/images/), and run this again.\n`)
  process.exit(0)
}

console.log(`\nOptimising photos from ${SOURCE}/ ...\n`)
await walk(SOURCE)

console.log(`\n  ${converted} converted, ${skipped} already up to date`)
if (converted) {
  console.log(`  ${mb(bytesIn)} → ${mb(bytesOut)} (${Math.round((1 - bytesOut / bytesIn) * 100)}% smaller)`)
}
console.log('')

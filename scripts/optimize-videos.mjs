/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  npm run optimize:vid                                                ║
 * ║                                                                      ║
 * ║  Raw phone video is roughly 50–100 MB per minute. Five clips of      ║
 * ║  that and the site is dead on mobile data. This compresses each      ║
 * ║  one to 720p H.264 — typically 20–30× smaller, with no visible       ║
 * ║  difference on a phone screen — and pulls out a poster frame so      ║
 * ║  the archive isn't a row of black rectangles.                        ║
 * ║                                                                      ║
 * ║  Needs ffmpeg:  https://ffmpeg.org/download.html                     ║
 * ║  (Windows: winget install Gyan.FFmpeg)                               ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { readdir, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const run = promisify(execFile)

const SOURCE = 'assets-raw/videos'
const OUTPUT = 'public/videos'
const EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.avi', '.mkv', '.webm'])

/** CRF 26 is the sweet spot: small, and you cannot see the difference. */
const CRF = '26'
const MAX_HEIGHT = 720

async function hasFfmpeg() {
  try {
    await run('ffmpeg', ['-version'])
    return true
  } catch {
    return false
  }
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`

if (!existsSync(SOURCE)) {
  console.log(`\nNothing to do — ${SOURCE}/ doesn't exist yet.`)
  console.log('Create it, drop your clips in, and run this again.\n')
  process.exit(0)
}

if (!(await hasFfmpeg())) {
  console.error('\n  ffmpeg is not installed, or not on your PATH.\n')
  console.error('  Windows:  winget install Gyan.FFmpeg')
  console.error('  Mac:      brew install ffmpeg')
  console.error('\n  Or compress the clips by hand and drop the .mp4 files')
  console.error(`  straight into ${OUTPUT}/ — the site only needs the finished files.\n`)
  process.exit(1)
}

await mkdir(OUTPUT, { recursive: true })

const files = (await readdir(SOURCE, { withFileTypes: true }))
  .filter((e) => e.isFile() && EXTENSIONS.has(path.extname(e.name).toLowerCase()))
  .map((e) => path.join(SOURCE, e.name))

if (!files.length) {
  console.log(`\nNo videos found in ${SOURCE}/\n`)
  process.exit(0)
}

console.log(`\nCompressing ${files.length} clip(s)...\n`)

let bytesIn = 0
let bytesOut = 0

for (const file of files) {
  const base = path.basename(file, path.extname(file))
  const outVideo = path.join(OUTPUT, `${base}.mp4`)
  const outPoster = path.join(OUTPUT, `${base}.jpg`)

  const source = await stat(file)
  if (existsSync(outVideo) && (await stat(outVideo)).mtimeMs > source.mtimeMs) {
    console.log(`  · ${base} already up to date`)
    continue
  }

  process.stdout.write(`  … ${base} (${mb(source.size)})`)

  await run('ffmpeg', [
    '-y',
    '-i', file,
    // Scale to 720p tall, keeping aspect; -2 keeps width even (H.264 needs it).
    '-vf', `scale=-2:'min(${MAX_HEIGHT},ih)'`,
    '-c:v', 'libx264',
    '-crf', CRF,
    '-preset', 'slow',
    '-profile:v', 'main',
    // Metadata at the front, so it starts playing before it finishes loading.
    '-movflags', '+faststart',
    // Baseline-compatible pixel format — some Android players need this.
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    outVideo,
  ])

  // Poster frame from one second in — frame zero is usually a blurry mess.
  await run('ffmpeg', [
    '-y',
    '-ss', '1',
    '-i', outVideo,
    '-frames:v', '1',
    '-q:v', '4',
    outPoster,
  ])

  const result = await stat(outVideo)
  bytesIn += source.size
  bytesOut += result.size
  process.stdout.write(` → ${mb(result.size)}\n`)
}

if (bytesIn) {
  console.log(`\n  ${mb(bytesIn)} → ${mb(bytesOut)} (${Math.round((1 - bytesOut / bytesIn) * 100)}% smaller)`)
}
console.log(`\n  Done. Point videos.ts at /videos/<name>.mp4 and /videos/<name>.jpg\n`)

/**
 * Pulls a frame out of every clip in S/ and lays them out as one sheet,
 * so the archive can be labelled without opening eleven video players.
 *
 *   node scripts/video-sheet.mjs
 */
import { readdir, mkdir, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)
const SOURCE = 'S'
const OUT = 'scratch/vid'
const CELL = 320
const COLS = 4

await mkdir(OUT, { recursive: true })

const files = (await readdir(SOURCE, { withFileTypes: true }))
  .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.mp4'))
  .map((e) => e.name)
  .sort()

const info = []

for (const [i, name] of files.entries()) {
  const full = path.join(SOURCE, name)

  // Duration, so the archive can show a runtime and we can grab a frame
  // from somewhere representative rather than the first blurry one.
  let seconds = 0
  try {
    const { stdout } = await run('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1', full,
    ])
    seconds = Math.round(parseFloat(stdout.trim()) || 0)
  } catch {
    /* ffprobe missing — duration stays 0 and we grab from 1s */
  }

  const frame = path.join(OUT, `${i + 1}.jpg`)

  /**
   * Two things bite here: seeking past the end of a short clip yields no
   * frame at all, and iPhone HEVC is often flagged limited-range, which the
   * mjpeg encoder refuses outright. Forcing the pixel format fixes the
   * second; falling back to the first frame fixes the first.
   */
  const grab = async (at) =>
    run('ffmpeg', [
      '-y', '-ss', String(at), '-i', full,
      '-frames:v', '1', '-vf', 'format=yuvj420p', '-q:v', '3', frame,
    ])

  const at = seconds > 4 ? Math.floor(seconds * 0.35) : 0
  try {
    await grab(at)
  } catch {
    try {
      await grab(0)
    } catch {
      console.log(`  ${i + 1}. ${name} — could not read a frame, skipping`)
      continue
    }
  }

  info.push({
    n: i + 1,
    name,
    seconds,
    duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`,
    frame,
  })
  console.log(`  ${i + 1}. ${name.padEnd(30)} ${info[i].duration}`)
}

const rows = Math.ceil(info.length / COLS)
const cells = await Promise.all(
  info.map(async (v, i) => ({
    input: await sharp(v.frame).resize(CELL, CELL, { fit: 'cover' }).toBuffer(),
    left: (i % COLS) * CELL,
    top: Math.floor(i / COLS) * CELL,
  }))
)

await sharp({
  create: { width: COLS * CELL, height: rows * CELL, channels: 3, background: { r: 10, g: 9, b: 8 } },
})
  .composite(cells)
  .jpeg({ quality: 80 })
  .toFile(`${OUT}/sheet.jpg`)

await writeFile(`${OUT}/index.json`, JSON.stringify(info, null, 2))
console.log(`\n  Sheet → ${OUT}/sheet.jpg  (left→right, top→bottom)\n`)

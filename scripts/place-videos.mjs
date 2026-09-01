/**
 * One-time: compresses the real clips out of S/ into public/videos/ as
 * memory-01…11, pulls a poster frame for each, and prints a ready-made
 * videos.ts.
 *
 *   node scripts/place-videos.mjs
 *
 * Labels describe what is visibly in each clip. Rewrite them — you know what
 * was actually happening and I don't.
 */
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const run = promisify(execFile)
const OUT = 'public/videos'

/** Order here is the order of the archive. n matches scratch/vid/index.json. */
const CLIPS = [
  { n: 5, label: 'asleep at his desk' },
  { n: 4, label: 'tongue out, in public' },
  { n: 3, label: 'upside down, no explanation' },
  { n: 1, label: 'too close to the camera' },
  { n: 6, label: 'sunglasses. indoors.' },
  { n: 2, label: 'mid-sentence' },
  { n: 9, label: 'the office' },
  { n: 8, label: 'actually working' },
  { n: 7, label: 'looking up at nothing' },
  { n: 10, label: 'the photo strip', afterQuote: 'Photos captured a second.' },
  { n: 11, label: 'the long one', afterQuote: 'Videos captured everything around it.' },
]

const index = JSON.parse(
  await (await import('node:fs/promises')).readFile('scratch/vid/index.json', 'utf-8')
)

await mkdir(OUT, { recursive: true })

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`
let bytesIn = 0
let bytesOut = 0
const written = []

console.log('')

for (const [i, clip] of CLIPS.entries()) {
  const source = index.find((v) => v.n === clip.n)
  if (!source) {
    console.log(`  ! no source for #${clip.n}`)
    continue
  }

  const full = path.join('S', source.name)
  const base = `memory-${String(i + 1).padStart(2, '0')}`
  const outVideo = path.join(OUT, `${base}.mp4`)
  const outPoster = path.join(OUT, `${base}.jpg`)

  const src = await stat(full)
  bytesIn += src.size
  process.stdout.write(`  ${base}  ${source.name.padEnd(28)} ${mb(src.size).padStart(9)}`)

  await run('ffmpeg', [
    '-y', '-i', full,
    // -2 keeps the width even, which H.264 requires.
    '-vf', "scale=-2:'min(720,ih)',format=yuv420p",
    '-c:v', 'libx264',
    '-crf', '26',
    '-preset', 'slow',
    '-profile:v', 'main',
    // Metadata at the front so it starts playing before it finishes loading.
    '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '128k',
    outVideo,
  ])

  const at = source.seconds > 4 ? Math.floor(source.seconds * 0.35) : 0
  try {
    await run('ffmpeg', ['-y', '-ss', String(at), '-i', outVideo, '-frames:v', '1', '-vf', 'format=yuvj420p', '-q:v', '4', outPoster])
  } catch {
    await run('ffmpeg', ['-y', '-i', outVideo, '-frames:v', '1', '-vf', 'format=yuvj420p', '-q:v', '4', outPoster])
  }

  const result = await stat(outVideo)
  bytesOut += result.size
  console.log(` → ${mb(result.size)}`)

  written.push({ base, label: clip.label, duration: source.duration, afterQuote: clip.afterQuote })
}

console.log(`\n  ${mb(bytesIn)} → ${mb(bytesOut)} (${Math.round((1 - bytesOut / bytesIn) * 100)}% smaller)\n`)

/* ------------------------------------------------------------ videos.ts */

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

const body = written
  .map((v, i) => {
    const lines = [
      `    id: 'v${i + 1}'`,
      `    code: 'MEMORY_${String(i + 1).padStart(2, '0')}'`,
      `    label: '${esc(v.label)}'`,
      `    src: '/videos/${v.base}.mp4'`,
      `    poster: '/videos/${v.base}.jpg'`,
      `    duration: '${v.duration}'`,
    ]
    if (v.afterQuote) lines.push(`    afterQuote: '${esc(v.afterQuote)}'`)
    return `  {\n${lines.join(',\n')},\n  },`
  })
  .join('\n')

await writeFile(
  'src/content/videos.ts',
  `import type { Video } from './types'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE MEMORY ARCHIVE — all ${written.length} clips, already compressed.            ║
 * ║                                                                      ║
 * ║  The labels below describe what is visibly happening in each clip.   ║
 * ║  Rewrite them: you know what was actually going on and the labels    ║
 * ║  are half the joke.                                                  ║
 * ║                                                                      ║
 * ║  Nothing downloads until he taps a specific memory, so a long list   ║
 * ║  costs him nothing.                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
export const videos: Video[] = [
${body}
]

export const videoById = (id: string) => videos.find((v) => v.id === id)
`
)

console.log('  Wrote src/content/videos.ts\n')

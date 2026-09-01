/**
 * One-time: takes the real photos out of S/, optimises them, files them into
 * the right chapter folder, and prints a ready-made memories.ts.
 *
 *   node scripts/place-assets.mjs
 *
 * The chapter for each photo was chosen by looking at it. Alt text describes
 * what is actually in the frame — nothing is invented about the two of them.
 * Reorder freely afterwards; this script is scaffolding, not the source of
 * truth. src/content/memories.ts is.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import sharp from 'sharp'

const run = promisify(execFile)
const SOURCE = 'S'
const WIDTHS = [640, 1080, 1600]
const HEIC_CACHE = 'scratch/heic'

const FOLDER = {
  beginning: 'intro',
  chaos: 'funny',
  moments: 'memories',
  unsaid: 'heartfelt',
  finale: 'final',
}

/** n → [chapter, alt]. n is the position in scratch/sheets/index.json. */
const PLACEMENT = {
  1: ['beginning', 'him on a rope bridge, squinting into the sun'],
  2: ['chaos', 'her holding bunny ears over his head while he grins'],
  3: ['moments', 'the two of them showing off painted nails to the camera'],
  4: ['moments', 'the two of them close together indoors, half in shadow'],
  5: ['beginning', 'the two of them outside on the grass, posing properly for once'],
  6: ['chaos', 'her doubled over laughing while someone holds her head up'],
  7: ['chaos', 'her hand under his chin, both grinning at the camera'],
  8: ['finale', 'the two of them at night, faces lit and laughing'],
  9: ['unsaid', 'a close selfie of the two of them with a heart scrawled on it'],
  10: ['beginning', 'the two of them sitting on the steps of a white building'],
  11: ['beginning', 'the two of them in white, heads bent over a phone together'],
  12: ['chaos', 'a dark room at 12:09 AM, him in glasses'],
  13: ['moments', 'the two of them at a night festival in matching red shirts'],
  14: ['moments', 'close up at the festival, face paint under her eye'],
  15: ['beginning', 'him handing her a certificate on the lawn'],
  16: ['moments', 'the two of them outdoors at golden hour, trees behind'],
  17: ['chaos', 'both of them covered in green festival colour'],
  18: ['moments', 'a close selfie of the two of them indoors'],
  19: ['chaos', 'her throwing a peace sign next to him'],
  20: ['moments', 'the two of them close, both mid laugh'],
  21: ['chaos', 'her pulling a face with her arm in the air'],
  22: ['chaos', 'a video call, caught mid sentence'],
  23: ['chaos', 'the same video call, him fixing his hair'],
  24: ['moments', 'a mirror selfie in a clothes shop'],
  25: ['moments', 'another mirror selfie, both of them in the frame'],
  26: ['chaos', 'an extremely dark video call close up of his face'],
  27: ['chaos', 'the same call, no better lit'],
  28: ['moments', 'him in a pink t-shirt, cropped at the shoulders'],
  29: ['finale', 'a baby photo propped against a striped backdrop'],
  30: ['unsaid', 'her face in near darkness with a heart beside it'],
  31: ['moments', 'him in profile on a busy street'],
  32: ['moments', 'the same street, a second later'],
  33: ['chaos', 'him in sunglasses, unimpressed, in a red shirt'],
  34: ['moments', 'a mirror selfie in a long white corridor'],
  35: ['moments', 'the two of them browsing a wall of shoes'],
  36: ['moments', 'his reflection in a scooter mirror on an empty road'],
  37: ['unsaid', 'him holding a baby, both looking at the camera'],
  38: ['unsaid', 'the same baby, now chewing on something'],
  39: ['moments', 'the two of them at a cafe table'],
  40: ['finale', 'the two of them under a green archway by the sea'],
  41: ['moments', 'a close selfie by the water, temple marks on their foreheads'],
  42: ['chaos', 'the two of them somewhere in a clothes shop, caught from across the room'],
  43: ['moments', 'a mirror selfie, phone raised between them'],
  44: ['moments', 'another shop mirror, both in frame'],
  45: ['chaos', 'the two of them reflected in a claw machine full of Mickeys'],
  46: ['chaos', 'the same claw machine, still no Mickey'],
  47: ['chaos', 'four selfies at once, tongues out in all of them'],
  48: ['moments', 'a close selfie indoors, both smiling'],
  49: ['chaos', 'his face far too close to the lens'],
  50: ['chaos', 'both of them wide eyed at the camera'],
  51: ['finale', 'the two of them grinning, foreheads almost touching'],
  52: ['moments', 'another close one, quieter'],
  53: ['unsaid', 'the two of them close, her giving a thumbs up'],
  54: ['chaos', 'both of them with their tongues out'],
  55: ['favourite', 'the two of them close together, both properly smiling'],
  56: ['moments', 'a mirror selfie among the clothes racks'],
  57: ['moments', 'a mirror selfie in a stairwell'],
  58: ['chaos', 'two pairs of feet on paving, in black and white'],
  59: ['moments', 'a selfie in a shop, him behind her'],
  60: ['finale', 'the two of them reflected in a glass door, trees behind'],
  61: ['chaos', 'her in front, him hiding behind his hand'],
  62: ['chaos', 'a black and white selfie taken upside down'],
  63: ['moments', 'him stretched out on a sofa at home'],
  64: ['unsaid', 'her in front, him just behind her shoulder'],
  65: ['chaos', 'black and white, a caption reading eh'],
  66: ['chaos', 'black and white, both of them laughing at something'],
  67: ['unsaid', 'the two of them lying down, a heart between them'],
  68: ['unsaid', 'her smiling, him just behind her'],
  69: ['chaos', 'an odd angle, him upside down at the bottom of the frame'],
  70: ['chaos', 'her tongue out, him behind her'],
  71: ['unsaid', 'the two of them lying down, heads together'],
  72: ['unsaid', 'lying down at 8:21pm'],
  73: ['unsaid', 'a close one with a heart written on it'],
  74: ['chaos', 'her tongue out in a shoe shop, him laughing behind'],
}

/** Photos she "sends" inside the chat. Copied, not moved. */
const CHAT_PHOTOS = { 47: 'chat-01', 51: 'chat-02' }

/** sharp cannot decode HEIC on most Windows builds; ffmpeg can. */
async function decodable(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext !== '.heic' && ext !== '.heif') return file
  await mkdir(HEIC_CACHE, { recursive: true })
  const cached = path.join(HEIC_CACHE, `${path.basename(file, ext)}.jpg`)
  if (!existsSync(cached)) {
    await run('ffmpeg', ['-y', '-i', file, '-frames:v', '1', '-update', '1', '-q:v', '2', cached])
  }
  return cached
}

async function emit(source, outDir, base) {
  await mkdir(outDir, { recursive: true })
  const image = sharp(source).rotate()
  const meta = await image.metadata()
  let bytes = 0
  for (const width of WIDTHS) {
    const target = meta.width && meta.width < width ? meta.width : width
    const info = await image
      .clone()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(outDir, `${base}-${width}.webp`))
    bytes += info.size
  }
  return { bytes, portrait: (meta.height ?? 0) > (meta.width ?? 0) }
}

/* ------------------------------------------------------------------ run */

const index = JSON.parse(
  await (await import('node:fs/promises')).readFile('scratch/sheets/index.json', 'utf-8')
)

const counters = {}
const placed = []
let bytesOut = 0

console.log('')
for (const entry of index) {
  const rule = PLACEMENT[entry.n]
  if (!rule) {
    console.log(`  ? no placement for #${entry.n} ${entry.name} — skipped`)
    continue
  }
  const [chapter, alt] = rule
  const isFav = chapter === 'favourite'
  const realChapter = isFav ? 'finale' : chapter
  const folder = FOLDER[realChapter]

  counters[realChapter] = (counters[realChapter] ?? 0) + 1
  const base = isFav ? 'favourite' : `${realChapter}-${String(counters[realChapter]).padStart(2, '0')}`

  const source = await decodable(path.join(SOURCE, entry.name))
  const { bytes, portrait } = await emit(source, `public/images/${folder}`, base)
  bytesOut += bytes

  if (CHAT_PHOTOS[entry.n]) {
    await emit(source, 'public/images/chat', CHAT_PHOTOS[entry.n])
  }

  placed.push({
    id: isFav ? 'favourite' : `${realChapter[0]}${counters[realChapter]}`,
    src: `/images/${folder}/${base}`,
    alt,
    chapter: realChapter,
    date: entry.date,
    portrait,
    original: entry.name,
  })

  process.stdout.write(`\r  ${placed.length}/${index.length} placed`)
}

console.log('\n')
for (const [chapter, n] of Object.entries(counters)) console.log(`  ${chapter.padEnd(11)} ${n}`)
console.log(`\n  ${(bytesOut / 1024 / 1024).toFixed(1)} MB of webp written\n`)

await writeFile('scratch/placed.json', JSON.stringify(placed, null, 2))
console.log('  Manifest → scratch/placed.json\n')

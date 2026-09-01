/**
 * Turns scratch/placed.json into src/content/memories.ts.
 *
 * Run once, after place-assets.mjs. After that, memories.ts is the source of
 * truth — edit it by hand and never run this again, or you'll overwrite your
 * captions.
 */
import { readFile, writeFile } from 'node:fs/promises'

const placed = JSON.parse(await readFile('scratch/placed.json', 'utf-8'))

/**
 * Her words, placed. Keyed by "chapter:position", so moving a photo around
 * doesn't drag its line with it — the line belongs to the moment in the
 * story, not to the picture.
 *
 * Values are keys into src/content/quotes.ts, emitted as `q.whatever` so the
 * text itself lives in exactly one place.
 */
const QUOTES = {
  'beginning:1': 'neverExpected',
  'beginning:2': 'startedAsAFriend',
  'beginning:4': 'firstBestFriend',
  'beginning:5': 'pathsCrossed',

  'moments:1': 'momentsYouWereThere',
  'moments:4': 'yourFaceInThem',
  'moments:7': 'notJustPictures',
  'moments:10': 'howTheyFelt',
  'moments:13': 'keepMomentsForever',
  'moments:16': 'partOfMyStory',
  'moments:20': 'veryFewUnderstand',
  'moments:23': 'oneOfThoseFew',

  /* Chapter 4 is the one that carries the weight — every photo gets a line. */
  'unsaid:1': 'mayNotAlwaysSay',
  'unsaid:2': 'likeMyMom',
  'unsaid:3': 'littleWays',
  'unsaid:4': 'iNotice',
  'unsaid:5': 'checkOnMe',
  'unsaid:6': 'didYouEat',
  'unsaid:7': 'whenYoureNotYourself',
  'unsaid:8': 'theWayITrustYou',
  'unsaid:9': 'earnedAPlace',
  'unsaid:10': 'iWantToTakeCareOfYou',
  'unsaid:11': 'favouritePerson',
}

/**
 * Handwritten, on the polaroids. Ten of the twenty-seven carry one of her
 * lines; the rest are left blank for the jokes only she knows.
 */
const SCRIBBLES = {
  2: 'completelyMyself',
  5: 'noBigDeal',
  8: 'thingsYouForget',
  11: 'smallestGestures',
  14: 'nothingExtraordinary',
  17: 'ordinaryDays',
  20: 'andStillStayed',
  23: 'chaoticDay',
  25: 'neverRunOut',
  27: 'safestPerson',
}

/** A faint camera-roll label on a handful of frames. Not on all of them. */
const META_EVERY = 5

const HEADERS = {
  beginning: `  /* ═══════════════════════════ 01 — BEGINNING ═══════════════════════════
   * The earliest ones. Quiet, slow, one at a time.
   */`,
  chaos: `  /* ════════════════════════════ 02 — CHAOS ═══════════════════════════════
   * Polaroids. Every one of these wants a scribble in your handwriting —
   * that's the bit that makes it feel like you and not a gallery.
   */`,
  moments: `  /* ══════════════════════════ 03 — THE MOMENTS ═══════════════════════════
   * The big ones. Not every photo needs a quote; the silence between them
   * is doing work.
   */`,
  unsaid: `  /* ═════════════════════ 04 — THINGS I MAY NOT ALWAYS SAY ════════════════
   * The closest ones. One line each. Nothing rushes here.
   */`,
  finale: `  /* ══════════════════════════ 05 — THE FINALE ════════════════════════════
   * These drift past during the birthday reveal. 'favourite' is the very
   * last image on the site — the one he's left looking at.
   */`,
}

const ORDER = ['beginning', 'chaos', 'moments', 'unsaid', 'finale']
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

let out = `import type { Photo } from './types'
import { q } from './quotes'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ALL ${placed.length} PHOTOS.                                                    ║
 * ║                                                                      ║
 * ║  Already converted, sized and filed — the images exist and the site  ║
 * ║  works right now. What's left is yours: the quotes, and the          ║
 * ║  handwritten scribbles marked [like this].                           ║
 * ║                                                                      ║
 * ║  \`src\` deliberately has no extension. Three widths sit next to each  ║
 * ║  other on disk and the browser picks whichever suits his screen.     ║
 * ║                                                                      ║
 * ║  Move a photo to another chapter by changing its \`chapter\` — nothing ║
 * ║  else needs touching. Delete one by deleting its block.              ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
export const memories: Photo[] = [
`

for (const chapter of ORDER) {
  const list = placed.filter((p) => p.chapter === chapter && p.id !== 'favourite')
  const fav = chapter === 'finale' ? placed.find((p) => p.id === 'favourite') : null

  out += `${HEADERS[chapter]}\n`

  list.forEach((p, i) => {
    const n = i + 1
    const quote = QUOTES[`${chapter}:${n}`]
    const fields = [
      `    id: '${p.id}'`,
      `    src: '${p.src}'`,
      `    alt: '${esc(p.alt)}'`,
      `    chapter: '${chapter}'`,
    ]
    if (quote) fields.push(`    quote: q.${quote}`)
    if (chapter === 'chaos') {
      const scribble = SCRIBBLES[n]
      fields.push(scribble ? `    scribble: q.${scribble}` : `    scribble: '[your caption]'`)
      fields.push(`    rotate: ${[-5, 4, -2, 6, -6, 3, -3, 5][i % 8]}`)
    }
    if (n % META_EVERY === 1 && chapter !== 'chaos') {
      fields.push(`    meta: '${p.date} · [what day was this?]'`)
    }
    out += `  {\n${fields.join(',\n')},\n  },\n`
  })

  if (fav) {
    out += `  {
    id: 'favourite',
    src: '${fav.src}',
    alt: '${esc(fav.alt)}',
    chapter: 'finale',
    // The last thing he sees. Swap this for a different one any time —
    // just point finale.ts's favouritePhotoId at whichever id you want.
  },\n`
  }
  out += '\n'
}

out += `]

/* --------------------------------------------------------------- helpers */

export const byChapter = (chapter: Photo['chapter']) =>
  memories.filter((p) => p.chapter === chapter)

export const photoById = (id: string) => memories.find((p) => p.id === id)

/** Every photo except the finale ones — what the montage runs through. */
export const journeyPhotos = memories.filter((p) => p.chapter !== 'finale')
`

await writeFile('src/content/memories.ts', out)
console.log(`\n  Wrote src/content/memories.ts — ${placed.length} photos\n`)
for (const c of ORDER) {
  console.log(`    ${c.padEnd(11)} ${placed.filter((p) => p.chapter === c).length}`)
}
console.log('')

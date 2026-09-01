import type { Photo } from './types'
import { q } from './quotes'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ALL 74 PHOTOS.                                                    ║
 * ║                                                                      ║
 * ║  Already converted, sized and filed — the images exist and the site  ║
 * ║  works right now. What's left is yours: the quotes, and the          ║
 * ║  handwritten scribbles marked [like this].                           ║
 * ║                                                                      ║
 * ║  `src` deliberately has no extension. Three widths sit next to each  ║
 * ║  other on disk and the browser picks whichever suits his screen.     ║
 * ║                                                                      ║
 * ║  Move a photo to another chapter by changing its `chapter` — nothing ║
 * ║  else needs touching. Delete one by deleting its block.              ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
export const memories: Photo[] = [
  /* ═══════════════════════════ 01 — BEGINNING ═══════════════════════════
   * The earliest ones. Quiet, slow, one at a time.
   */
  {
    id: 'b1',
    src: '/images/intro/beginning-01',
    alt: 'him on a rope bridge, squinting into the sun',
    chapter: 'beginning',
    quote: q.neverExpected,
    meta: '2025-05-24 · [what day was this?]',
  },
  {
    id: 'b2',
    src: '/images/intro/beginning-02',
    alt: 'the two of them outside on the grass, posing properly for once',
    chapter: 'beginning',
    quote: q.startedAsAFriend,
  },
  {
    id: 'b3',
    src: '/images/intro/beginning-03',
    alt: 'the two of them sitting on the steps of a white building',
    chapter: 'beginning',
  },
  {
    id: 'b4',
    src: '/images/intro/beginning-04',
    alt: 'the two of them in white, heads bent over a phone together',
    chapter: 'beginning',
    quote: q.firstBestFriend,
  },
  {
    id: 'b5',
    src: '/images/intro/beginning-05',
    alt: 'him handing her a certificate on the lawn',
    chapter: 'beginning',
    quote: q.pathsCrossed,
  },

  /* ════════════════════════════ 02 — CHAOS ═══════════════════════════════
   * Polaroids. Every one of these wants a scribble in your handwriting —
   * that's the bit that makes it feel like you and not a gallery.
   */
  {
    id: 'c1',
    src: '/images/funny/chaos-01',
    alt: 'her holding bunny ears over his head while he grins',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -5,
  },
  {
    id: 'c2',
    src: '/images/funny/chaos-02',
    alt: 'her doubled over laughing while someone holds her head up',
    chapter: 'chaos',
    scribble: q.completelyMyself,
    rotate: 4,
  },
  {
    id: 'c3',
    src: '/images/funny/chaos-03',
    alt: 'her hand under his chin, both grinning at the camera',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -2,
  },
  {
    id: 'c4',
    src: '/images/funny/chaos-04',
    alt: 'a dark room at 12:09 AM, him in glasses',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 6,
  },
  {
    id: 'c5',
    src: '/images/funny/chaos-05',
    alt: 'both of them covered in green festival colour',
    chapter: 'chaos',
    scribble: q.noBigDeal,
    rotate: -6,
  },
  {
    id: 'c6',
    src: '/images/funny/chaos-06',
    alt: 'her throwing a peace sign next to him',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 3,
  },
  {
    id: 'c7',
    src: '/images/funny/chaos-07',
    alt: 'her pulling a face with her arm in the air',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -3,
  },
  {
    id: 'c8',
    src: '/images/funny/chaos-08',
    alt: 'a video call, caught mid sentence',
    chapter: 'chaos',
    scribble: q.thingsYouForget,
    rotate: 5,
  },
  {
    id: 'c9',
    src: '/images/funny/chaos-09',
    alt: 'the same video call, him fixing his hair',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -5,
  },
  {
    id: 'c10',
    src: '/images/funny/chaos-10',
    alt: 'an extremely dark video call close up of his face',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 4,
  },
  {
    id: 'c11',
    src: '/images/funny/chaos-11',
    alt: 'the same call, no better lit',
    chapter: 'chaos',
    scribble: q.smallestGestures,
    rotate: -2,
  },
  {
    id: 'c12',
    src: '/images/funny/chaos-12',
    alt: 'him in sunglasses, unimpressed, in a red shirt',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 6,
  },
  {
    id: 'c13',
    src: '/images/funny/chaos-13',
    alt: 'the two of them somewhere in a clothes shop, caught from across the room',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -6,
  },
  {
    id: 'c14',
    src: '/images/funny/chaos-14',
    alt: 'the two of them reflected in a claw machine full of Mickeys',
    chapter: 'chaos',
    scribble: q.nothingExtraordinary,
    rotate: 3,
  },
  {
    id: 'c15',
    src: '/images/funny/chaos-15',
    alt: 'the same claw machine, still no Mickey',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -3,
  },
  {
    id: 'c16',
    src: '/images/funny/chaos-16',
    alt: 'four selfies at once, tongues out in all of them',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 5,
  },
  {
    id: 'c17',
    src: '/images/funny/chaos-17',
    alt: 'his face far too close to the lens',
    chapter: 'chaos',
    scribble: q.ordinaryDays,
    rotate: -5,
  },
  {
    id: 'c18',
    src: '/images/funny/chaos-18',
    alt: 'both of them wide eyed at the camera',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 4,
  },
  {
    id: 'c19',
    src: '/images/funny/chaos-19',
    alt: 'both of them with their tongues out',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -2,
  },
  {
    id: 'c20',
    src: '/images/funny/chaos-20',
    alt: 'two pairs of feet on paving, in black and white',
    chapter: 'chaos',
    scribble: q.andStillStayed,
    rotate: 6,
  },
  {
    id: 'c21',
    src: '/images/funny/chaos-21',
    alt: 'her in front, him hiding behind his hand',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: -6,
  },
  {
    id: 'c22',
    src: '/images/funny/chaos-22',
    alt: 'a black and white selfie taken upside down',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 3,
  },
  {
    id: 'c23',
    src: '/images/funny/chaos-23',
    alt: 'black and white, a caption reading eh',
    chapter: 'chaos',
    scribble: q.chaoticDay,
    rotate: -3,
  },
  {
    id: 'c24',
    src: '/images/funny/chaos-24',
    alt: 'black and white, both of them laughing at something',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 5,
  },
  {
    id: 'c25',
    src: '/images/funny/chaos-25',
    alt: 'an odd angle, him upside down at the bottom of the frame',
    chapter: 'chaos',
    scribble: q.neverRunOut,
    rotate: -5,
  },
  {
    id: 'c26',
    src: '/images/funny/chaos-26',
    alt: 'her tongue out, him behind her',
    chapter: 'chaos',
    scribble: '[your caption]',
    rotate: 4,
  },
  {
    id: 'c27',
    src: '/images/funny/chaos-27',
    alt: 'her tongue out in a shoe shop, him laughing behind',
    chapter: 'chaos',
    scribble: q.safestPerson,
    rotate: -2,
  },

  /* ══════════════════════════ 03 — THE MOMENTS ═══════════════════════════
   * The big ones. Not every photo needs a quote; the silence between them
   * is doing work.
   */
  {
    id: 'm1',
    src: '/images/memories/moments-01',
    alt: 'the two of them showing off painted nails to the camera',
    chapter: 'moments',
    quote: q.momentsYouWereThere,
    meta: '2025-10-28 · [what day was this?]',
  },
  {
    id: 'm2',
    src: '/images/memories/moments-02',
    alt: 'the two of them close together indoors, half in shadow',
    chapter: 'moments',
  },
  {
    id: 'm3',
    src: '/images/memories/moments-03',
    alt: 'the two of them at a night festival in matching red shirts',
    chapter: 'moments',
  },
  {
    id: 'm4',
    src: '/images/memories/moments-04',
    alt: 'close up at the festival, face paint under her eye',
    chapter: 'moments',
    quote: q.yourFaceInThem,
  },
  {
    id: 'm5',
    src: '/images/memories/moments-05',
    alt: 'the two of them outdoors at golden hour, trees behind',
    chapter: 'moments',
  },
  {
    id: 'm6',
    src: '/images/memories/moments-06',
    alt: 'a close selfie of the two of them indoors',
    chapter: 'moments',
    meta: '2026-04-16 · [what day was this?]',
  },
  {
    id: 'm7',
    src: '/images/memories/moments-07',
    alt: 'the two of them close, both mid laugh',
    chapter: 'moments',
    quote: q.notJustPictures,
  },
  {
    id: 'm8',
    src: '/images/memories/moments-08',
    alt: 'a mirror selfie in a clothes shop',
    chapter: 'moments',
  },
  {
    id: 'm9',
    src: '/images/memories/moments-09',
    alt: 'another mirror selfie, both of them in the frame',
    chapter: 'moments',
  },
  {
    id: 'm10',
    src: '/images/memories/moments-10',
    alt: 'him in a pink t-shirt, cropped at the shoulders',
    chapter: 'moments',
    quote: q.howTheyFelt,
  },
  {
    id: 'm11',
    src: '/images/memories/moments-11',
    alt: 'him in profile on a busy street',
    chapter: 'moments',
    meta: '2026-06-01 · [what day was this?]',
  },
  {
    id: 'm12',
    src: '/images/memories/moments-12',
    alt: 'the same street, a second later',
    chapter: 'moments',
  },
  {
    id: 'm13',
    src: '/images/memories/moments-13',
    alt: 'a mirror selfie in a long white corridor',
    chapter: 'moments',
    quote: q.keepMomentsForever,
  },
  {
    id: 'm14',
    src: '/images/memories/moments-14',
    alt: 'the two of them browsing a wall of shoes',
    chapter: 'moments',
  },
  {
    id: 'm15',
    src: '/images/memories/moments-15',
    alt: 'his reflection in a scooter mirror on an empty road',
    chapter: 'moments',
  },
  {
    id: 'm16',
    src: '/images/memories/moments-16',
    alt: 'the two of them at a cafe table',
    chapter: 'moments',
    quote: q.partOfMyStory,
    meta: '2026-06-20 · [what day was this?]',
  },
  {
    id: 'm17',
    src: '/images/memories/moments-17',
    alt: 'a close selfie by the water, temple marks on their foreheads',
    chapter: 'moments',
  },
  {
    id: 'm18',
    src: '/images/memories/moments-18',
    alt: 'a mirror selfie, phone raised between them',
    chapter: 'moments',
  },
  {
    id: 'm19',
    src: '/images/memories/moments-19',
    alt: 'another shop mirror, both in frame',
    chapter: 'moments',
  },
  {
    id: 'm20',
    src: '/images/memories/moments-20',
    alt: 'a close selfie indoors, both smiling',
    chapter: 'moments',
    quote: q.veryFewUnderstand,
  },
  {
    id: 'm21',
    src: '/images/memories/moments-21',
    alt: 'another close one, quieter',
    chapter: 'moments',
    meta: '2026-07-26 · [what day was this?]',
  },
  {
    id: 'm22',
    src: '/images/memories/moments-22',
    alt: 'a mirror selfie among the clothes racks',
    chapter: 'moments',
  },
  {
    id: 'm23',
    src: '/images/memories/moments-23',
    alt: 'a mirror selfie in a stairwell',
    chapter: 'moments',
    quote: q.oneOfThoseFew,
  },
  {
    id: 'm24',
    src: '/images/memories/moments-24',
    alt: 'a selfie in a shop, him behind her',
    chapter: 'moments',
  },
  {
    id: 'm25',
    src: '/images/memories/moments-25',
    alt: 'him stretched out on a sofa at home',
    chapter: 'moments',
  },

  /* ═════════════════════ 04 — THINGS I MAY NOT ALWAYS SAY ════════════════
   * The closest ones. One line each. Nothing rushes here.
   */
  {
    id: 'u1',
    src: '/images/heartfelt/unsaid-01',
    alt: 'a close selfie of the two of them with a heart scrawled on it',
    chapter: 'unsaid',
    quote: q.mayNotAlwaysSay,
    meta: '2026-01-21 · [what day was this?]',
  },
  {
    id: 'u2',
    src: '/images/heartfelt/unsaid-02',
    alt: 'her face in near darkness with a heart beside it',
    chapter: 'unsaid',
    quote: q.likeMyMom,
  },
  {
    id: 'u3',
    src: '/images/heartfelt/unsaid-03',
    alt: 'him holding a baby, both looking at the camera',
    chapter: 'unsaid',
    quote: q.littleWays,
  },
  {
    id: 'u4',
    src: '/images/heartfelt/unsaid-04',
    alt: 'the same baby, now chewing on something',
    chapter: 'unsaid',
    quote: q.iNotice,
  },
  {
    id: 'u5',
    src: '/images/heartfelt/unsaid-05',
    alt: 'the two of them close, her giving a thumbs up',
    chapter: 'unsaid',
    quote: q.checkOnMe,
  },
  {
    id: 'u6',
    src: '/images/heartfelt/unsaid-06',
    alt: 'her in front, him just behind her shoulder',
    chapter: 'unsaid',
    quote: q.didYouEat,
    meta: '2026-07-31 · [what day was this?]',
  },
  {
    id: 'u7',
    src: '/images/heartfelt/unsaid-07',
    alt: 'the two of them lying down, a heart between them',
    chapter: 'unsaid',
    quote: q.whenYoureNotYourself,
  },
  {
    id: 'u8',
    src: '/images/heartfelt/unsaid-08',
    alt: 'her smiling, him just behind her',
    chapter: 'unsaid',
    quote: q.theWayITrustYou,
  },
  {
    id: 'u9',
    src: '/images/heartfelt/unsaid-09',
    alt: 'the two of them lying down, heads together',
    chapter: 'unsaid',
    quote: q.earnedAPlace,
  },
  {
    id: 'u10',
    src: '/images/heartfelt/unsaid-10',
    alt: 'lying down at 8:21pm',
    chapter: 'unsaid',
    quote: q.iWantToTakeCareOfYou,
  },
  {
    id: 'u11',
    src: '/images/heartfelt/unsaid-11',
    alt: 'a close one with a heart written on it',
    chapter: 'unsaid',
    quote: q.favouritePerson,
    meta: '2026-07-31 · [what day was this?]',
  },

  /* ══════════════════════════ 05 — THE FINALE ════════════════════════════
   * These drift past during the birthday reveal. 'favourite' is the very
   * last image on the site — the one he's left looking at.
   */
  {
    id: 'f1',
    src: '/images/final/finale-01',
    alt: 'the two of them at night, faces lit and laughing',
    chapter: 'finale',
    meta: '2026-01-08 · [what day was this?]',
  },
  {
    id: 'f2',
    src: '/images/final/finale-02',
    alt: 'a baby photo propped against a striped backdrop',
    chapter: 'finale',
  },
  {
    id: 'f3',
    src: '/images/final/finale-03',
    alt: 'the two of them under a green archway by the sea',
    chapter: 'finale',
  },
  {
    id: 'f4',
    src: '/images/final/finale-04',
    alt: 'the two of them grinning, foreheads almost touching',
    chapter: 'finale',
  },
  {
    id: 'f6',
    src: '/images/final/finale-06',
    alt: 'the two of them reflected in a glass door, trees behind',
    chapter: 'finale',
  },
  {
    id: 'favourite',
    src: '/images/final/favourite',
    alt: 'the two of them close together, both properly smiling',
    chapter: 'finale',
    // The last thing he sees. Swap this for a different one any time —
    // just point finale.ts's favouritePhotoId at whichever id you want.
  },

]

/* --------------------------------------------------------------- helpers */

export const byChapter = (chapter: Photo['chapter']) =>
  memories.filter((p) => p.chapter === chapter)

export const photoById = (id: string) => memories.find((p) => p.id === id)

/** Every photo except the finale ones — what the montage runs through. */
export const journeyPhotos = memories.filter((p) => p.chapter !== 'finale')

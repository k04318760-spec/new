# Making it yours

Everything you need to change lives in `src/content/`. You never have to touch
a component. Work through this top to bottom and it'll take an evening.

---

## Where things stand

**Your 74 photos and 11 videos are already in.** They've been converted,
sized, filed into chapters and wired up — the site works right now, with your
actual memories in it.

What's left is the writing, and it's the part only you can do:

| | File | Time |
|---|---|---|
| 1 | **`config.ts`** — his name, your name, the nickname that opens the door | 5 min |
| 2 | **`chat.ts`** — the 15 questions. Every `[BRACKET]` is a blank | 40 min |
| 3 | **`memories.ts`** — 27 chaos photos want a `[your caption]` | 30 min |
| 4 | **`letters.ts`** — five sealed letters | 30 min |
| 5 | **`finale.ts`** — your actual birthday message | 20 min |
| 6 | Drop `.mp3` files into `public/music/` | 10 min |

Start at the top. After step 1 it's already recognisably yours.

```bash
npm run dev
```

---

## 1. Names and the front door — `src/content/config.ts`

```ts
him: { name: 'Actual Name', shortName: 'Name' }
her: { name: 'Your Name' }
```

**The gate** is the first thing he sees: one question only he can answer.

```ts
gate: {
  question: 'before I let you in —',
  subtitle: 'what do I always call you?',
  accept: ['chweetu', 'chweetuu'],   // any of these unlocks it
  mercyAfter: 4,                      // then it opens anyway, with a joke
}
```

Answers are compared with case, spaces and punctuation stripped — `"Chweetu!"`
and `"chweetu"` both work. Set `enabled: false` to skip the gate entirely.

**Optional time lock.** If you're sending the link early:

```ts
birthday: { lockUntil: '2026-09-14T00:00:00+05:30' }
```

The gift box then shows a live countdown until midnight and refuses to open.
Leave it `null` to disable.

---

## 2. Photos — `src/content/memories.ts`

All 74 of yours, already converted and filed by chapter. Each entry:

```ts
{
  id: 'm4',
  src: '/images/memories/moment-04',   // ← no file extension. On purpose.
  alt: 'us on the terrace, him mid-laugh',
  chapter: 'moments',
  quote: 'Some moments didn't feel special when they happened.',
  scribble: 'you were laughing at nothing',   // handwritten, over the photo
  meta: 'IMG_0472 · that random Tuesday',     // faint camera-roll label
}
```

| Field | Does what |
|---|---|
| `alt` | **Write these properly.** They're read aloud by screen readers, and they're what shows if a photo fails to load. |
| `quote` | Big cinematic line. Only some photos need one — silence between them is the point. |
| `scribble` | Your handwriting, laid over the photo. This is what makes it feel like you. |
| `meta` | Small mono label, bottom-left. Feels like a real camera roll. |
| `rotate` | Polaroid tilt, chaos chapter only. Between -8 and 8. |

### How yours were sorted

| Chapter | Yours | Folder | What went there |
|---|---|---|---|
| `beginning` | 5 | `public/images/intro/` | The earliest — May 2025 through the certificate one |
| `chaos` | 27 | `public/images/funny/` | Bunny ears, tongues out, the claw machine, the 12:09 AM one |
| `moments` | 25 | `public/images/memories/` | Yugam, the seaside, the mirror selfies, the street portraits |
| `unsaid` | 11 | `public/images/heartfelt/` | The close ones, the `<3` ones, him holding the baby |
| `finale` | 6 + 1 | `public/images/final/` | Drift past during the confetti |

`id: 'favourite'` is the very last image on the site — currently the one
where you're both properly smiling, close together. **Look at it and decide if
that's the one you want him left with.** Swap it by pointing
`finale.ts` → `favouritePhotoId` at any other id.

I sorted these by looking at them, so some will be in the wrong chapter for
reasons only you know. Moving one is a single word:

```ts
chapter: 'chaos',   →   chapter: 'unsaid',
```

Nothing else needs touching — the chapters read from this list.

### Adding more later

```bash
# Drop originals into assets-raw/images/<folder>/ then:
npm run optimize:img
```

Three WebP sizes per photo; the browser picks what fits his screen. A photo
that isn't there yet renders as a labelled placeholder naming the exact file
it wants, so the site never breaks while you work.

> **iPhone HEIC note:** sharp can't decode HEIC on Windows, so the four HEIC
> files of yours went through ffmpeg instead. That's already handled in the
> scripts — you don't have to do anything.

---

## 3. The conversation — `src/content/chat.ts`

This is about a third of the experience: three chat sessions, 15 questions,
woven between the photo chapters.

Placeholders to replace: `[THING]`, `[OPTION_A–D]`, `[HABIT_A–D]`,
`[ANNOYANCE_A–C]`, `[THIS]`/`[THAT]`, `[SCENARIO]`, `[REACTION_A–D]`.

### Question shapes

```ts
// multiple choice, scored
{
  kind: 'question', id: 'q01', scored: true,
  prompt: 'what is my favourite coffee order?',
  input: { type: 'choice', correctId: 'b', options: [
    { id: 'a', label: 'flat white' },
    { id: 'b', label: 'cold brew, no sugar' },
    { id: 'c', label: 'anything with caramel' },
    { id: 'd', label: 'tea. always tea.' },
  ]},
  reactions: {
    correct: ['okay ✅', 'correct. obviously. 😌'],
    wrong: ['……', 'wrong. and I am genuinely offended. 😂'],
  },
}
```

Other `input.type` values: `text` (free answer), `slider` (with `overshoot`
so he can break it past 100%), `thisOrThat`, `emojiScale`. An option with
`opensText: true` turns into a text box when picked — that's the
"Something else" escape hatch.

### Reactions

Every array gets picked from **at random**, so it never feels canned. Give
each two or three lines if you can be bothered.

```ts
reactions: {
  byOption: { me: ['correct answer detected. 😌❤️'] },  // most specific — wins
  byRange:  [{ min: 101, max: 999, lines: ['you broke the slider. 😂'] }],
  correct:  [...], wrong: [...],
  long:     ['okay you wrote a whole paragraph 🥹'],   // he wrote 18+ words
  short:    ['that is it? okay. 😂'],                   // he wrote 3 or fewer
  any:      [...],                                       // fallback
}
```

### Interruptions that aren't questions

```ts
{ kind: 'text', text: 'wait.', delay: 700 }
{ kind: 'pause', ms: 1200 }                        // a beat of silence
{ kind: 'photo', src: '/images/chat/chat-01',
  alt: '...', caption: 'remember this?' }          // she sends a photo mid-chat
```

The photo ones are worth the effort. It's the moment it stops reading like a
quiz and starts reading like her texting him.

---

## 4. Videos — `src/content/videos.ts`

All 11 of yours are in, compressed from 34.8 MB down to 8.9 MB. Nothing
downloads until he taps a specific one.

**The labels are the job here.** Right now they say what's visibly happening,
because that's all I could tell:

```ts
label: 'asleep at his desk',        // ← you know why that was funny. I don't.
label: 'sunglasses. indoors.',
label: 'the photo strip',
```

Those labels are the whole personality of the archive — he reads them as a
list before he taps anything. Rewrite all eleven.

To add more: drop clips into `assets-raw/videos/` and run
`npm run optimize:vid`.

---

## 5. Music — `src/content/songs.ts`

Drop `.mp3` files into `public/music/`. Keep each under ~4 MB — 128 kbps is
plenty through a phone speaker.

Which track plays where is `songForChapter` at the bottom of the file. The two
that matter most:

- `song-montage` — carries the 95-second montage. This is *the* song.
- `song-finale` — happier, starts the second the gift box opens.

Nothing plays until he taps "Start Your Surprise". That's not a bug — every
browser blocks audio before a real tap, and fighting it just produces silence.

---

## 6. Letters — `src/content/letters.ts`

The hidden surprise. Five sealed envelopes he opens whenever he needs them.

Each `body` line becomes its own paragraph, revealed one at a time, in your
handwriting font.

> Write these badly and honestly rather than well and carefully. He'll be able
> to tell the difference.

Add `voice: '/music/letter-miss.mp3'` to put a voice note under any letter.

---

## 7. The montage — `src/content/montage.ts`

You don't hand-time 30 photos. You give it a song length and eight text beats;
it spreads the photos across the runtime automatically.

```ts
durationSeconds: 95,      // match your song
beats: [
  { t: 2,  value: 'The beginning.', hold: 3 },
  { t: 62, value: 'You. ❤️', hold: 4 },
]
```

To tune it: play your song, note the seconds where it lifts, put a beat there.
That's the whole job.

---

## 8. The finale — `src/content/finale.ts`

Three parts:

- **`credits`** — the fake ending. Fill in the joke rows (`CATERING`,
  `LOCATIONS`). This is what sells it, because credits mean *over*.
- **`finale.lines`** — your actual birthday message, one line at a time.
  Shorter lines land harder. Resist the urge to explain.
- **`echoedAnswers`** — his own answers handed back to him at the end, in your
  handwriting. Point it at any question ids from `chat.ts`.

That last one is the moment the whole site has been building toward. Leave it on.

---

## Testing without sitting through it

```
localhost:5173/?dev=1                 skip the gate, arrow keys jump chapters
localhost:5173/?dev=1&at=finale       go straight to any step
localhost:5173/?selftest=1            check his answers will actually save
localhost:5173/#/vault                read what he wrote
```

Step ids for `at=`: `gate` `intro` `beginning` `chaos` `chat-01` `moments`
`chat-02` `unsaid` `videos` `letters` `chat-03` `montage` `credits` `finale`

---

And once your content is in:

```bash
npm run smoke
```

Drives the entire journey in a real browser as an iPhone and fails on any
console error, blank screen or sideways scroll. Screenshots land in
`scratch/shots/` so you can flick through every scene at once instead of
sitting through eleven minutes.

---

## Before you send it

- [ ] Every `[PLACEHOLDER]` replaced — search the project for `[` to find stragglers
- [ ] `npm run optimize:img` run, photos actually showing
- [ ] `?selftest=1` shows all green
- [ ] Opened it on your own phone, start to finish, with sound
- [ ] Checked the link preview in WhatsApp says nothing (it should just say "open this. 👀")
- [ ] Someone else's phone too, ideally the other OS

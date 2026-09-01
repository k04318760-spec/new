# PROJECT: [HIS_NAME]

An interactive memory journey, disguised as a birthday link.

```bash
npm install
npm run dev
```

Then open `localhost:5173`.

**Your 74 photos and 11 videos are already in it** — converted, sorted into
chapters and wired up. What's missing is the writing: names, the 15 chat
questions, the captions, the letters, the birthday message, and the music.

---

## Where to go next

| | |
|---|---|
| **[CONTENT.md](CONTENT.md)** | Replacing the photos, questions, songs, letters and messages |
| **[DEPLOY.md](DEPLOY.md)** | Getting it online, and getting his answers back to you |

Start with `src/content/config.ts` — names and the front door. Five minutes.

---

## The running order

```
   gate          one question only he can answer
   intro         black, a few lines, one button — music starts here
01 beginning     5 photos, slow
02 chaos         27 polaroids, draggable on desktop
   CHAT 01       5 questions, playful
03 moments       25 photos, the emotional one
   CHAT 02       6 questions, personal — the score lands here
04 unsaid        11 photos, closest ones
05 archive       11 videos, nothing loads until he picks one
   letters       "did you think that was everything?" → sealed envelopes
   CHAT 03       4 questions, ending on "who is [MY_NAME] to you?"
   montage       2 minutes, one song, 68 photos, eight words
   credits       the fake ending — a real credits roll, then silence
   finale        confetti, her message, and his own answers handed back
```

Roughly 13 minutes. He can never skip ahead — the whole thing rests on him not
knowing what's next.

**33 MB built**, images and video included.

---

## Testing shortcuts

```
/?dev=1                 skip the gate, arrow keys jump between chapters
/?dev=1&at=finale       jump straight to any step
/?selftest=1            verify his answers will actually reach you
/#/vault                read everything he wrote
```

```bash
npm run smoke           # drives the whole journey in a real browser
```

Loads the site as an iPhone, clicks through the gate, both photo chapters and
a full chat session, checks the answers actually landed in storage, then visits
every remaining scene on mobile and desktop. Fails on any console error, blank
screen or sideways scroll, and drops screenshots in `scratch/shots/`.

Run it after you swap your content in — it catches a broken photo path or a
malformed question faster than clicking through eleven minutes yourself.

---

## Project layout

```
src/
  content/       ← everything you edit lives here
    config.ts      names, the gate, storage, feature flags
    memories.ts    all 35 photos
    chat.ts        the three conversations
    videos.ts  songs.ts  letters.ts  montage.ts  finale.ts
  sections/      one file per scene
  components/    chat engine, photo chapters, video modal, chrome
  lib/
    answerStore.ts   his answers: local write, retry queue, beacon on close
    audio.ts         crossfading music, ducks under video
  vault/         your private read of his answers
apps-script/     paste into Google Apps Script — receives the answers
scripts/         npm run optimize — photos and video
```

---

## Built with

Vite · React 19 · TypeScript · Tailwind 4 · Motion · Lucide

Static build, no server. Deploys by dragging `dist` onto Netlify.

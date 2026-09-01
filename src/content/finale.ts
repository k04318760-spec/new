import type { Finale } from './types'
import { config } from './config'
import { q } from './quotes'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE FAKE ENDING, THE CREDITS, AND THE ACTUAL BIRTHDAY WISH.        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

/** Shown right after the montage, so he believes it's over. */
export const fakeEnding = {
  lines: ['And that’s everything.', 'Every photo.', 'Every video.', 'Every memory.'],
  thanks: 'Thank you for watching. ❤️',
}

/**
 * The credits roll. This is what sells the fake ending — he has been
 * trained his whole life to believe credits mean it is over.
 * Then there is a post-credits scene.
 */
export const credits = {
  title: `PROJECT: ${config.him.name}`,
  rows: [
    ['DIRECTED BY', config.her.name],
    ['STARRING', config.him.name],
    ['ALSO STARRING', config.her.name],
    ['CINEMATOGRAPHY', 'a phone camera, mostly'],
    ['SOUND', 'Nenjukkul Peidhidum — Harris Jayaraj'],
    ['FILMED OVER', '[HOW LONG YOU HAVE KNOWN HIM]'],
    ['LOCATIONS', '[PLACE], [PLACE], [PLACE]'],
    ['CATERING', '[INSIDE JOKE]'],
    ['NO MEMORIES WERE HARMED', 'in the making of this'],
  ] as Array<[string, string]>,
  /** The beat where he thinks it's over, before the interruption. */
  silenceMs: 4200,
}

/** The interruption. */
export const postCredits = {
  lines: ['...', 'wait.'],
  punchline:
    'did you really think I made this entire website just to say goodbye? 😂',
  cta: 'OPEN YOUR ACTUAL BIRTHDAY WISH 🎁',
}

/** The real thing. */
export const finale: Finale = {
  headline: 'HAPPY BIRTHDAY,',

  /**
   * The message, one line at a time, with no way to rush it.
   *
   * Your four heaviest lines are here, in the order they land hardest: the
   * two men, then your dad, then gratitude, then the one you wrote for
   * precisely this moment — "come back to this little corner of the
   * internet", said on the corner of the internet you made him.
   *
   * An empty string is a deliberate beat of silence. Keep them.
   */
  lines: [
    'I could have sent you a message.',
    'I could have called you at 12.',
    'But I wanted to give you something you could come back to.',
    'So I collected these moments.',
    'The funny ones.',
    'The random ones.',
    'The beautiful ones.',
    'And the ones that mean more to me than you probably realise.',
    '',
    q.twoMen,
    q.myDadAndYou,
    '',
    q.gratefulForNow,
    q.comeBackHere,
    '',
    q.happyBirthday,
  ],

  closing: 'Happy Birthday ❤️',

  /** The very last image. Points at an id in memories.ts. */
  favouritePhotoId: 'favourite',

  finalLine: 'To more memories. ❤️',

  playfulLine:
    "Maybe one day I'll have to make another website because 35 photos weren't enough. 😂",
}

/**
 * Woven into the finale: his own answers, handed back to him.
 * Point at any question ids from chat.ts.
 */
export const echoedAnswers = {
  enabled: true,
  intro: 'oh — and one more thing.',
  items: [
    { questionId: 'q14_who_is_nive', lead: 'you said I was' },
    { questionId: 'q09_miss_most', lead: "you said you'd miss" },
    { questionId: 'q15_hope_never_changes', lead: 'you hope I never change' },
  ],
  outro: "I'm keeping all of that. 🥹",
}

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  YOUR WORDS.                                                         ║
 * ║                                                                      ║
 * ║  All 54 of them, exactly as you wrote them, in one place.            ║
 * ║                                                                      ║
 * ║  Every other file refers to these by name — so if you change the     ║
 * ║  wording here, it changes everywhere it appears, and nothing ever    ║
 * ║  drifts out of sync.                                                 ║
 * ║                                                                      ║
 * ║  The comment above each group says where it currently lands. Move a  ║
 * ║  quote by editing the file that references it, not this one.         ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const q = {
  /* ── who you are to me ────────────── chapter 1, chapter 4, the finale ── */

  favouritePerson: 'You are my favourite person. ❤️',
  firstBestFriend:
    'You were my first best male friend, and somehow became so much more important to me than I ever expected.',
  startedAsAFriend:
    'You started as a friend and slowly became one of the most important people in my life.',
  neverExpected: 'I never expected one friendship to become this precious to me.',
  notJustSomeoneITalkTo:
    'You are not just someone I talk to; you are someone I genuinely care about.',
  nameHasAPlace:
    'If someone asks me about the people I love and trust the most, your name will always have a special place.',
  veryFewUnderstand:
    'There are many people in life, but very few make you feel truly understood.',
  oneOfThoseFew: 'Somehow, you became one of those very few people for me.',
  quietlyBetter: 'You are one of those people whose presence quietly makes life better.',

  /* ── the way you take care of me ───────────── chapter 4, "things I may
   *    not always say". These are the heart of that chapter.               */

  mayNotAlwaysSay:
    "I may not always say it, but I genuinely worry about you and care about you.",
  likeMyMom: 'The way you take care of me sometimes feels just like the way my mom does. ❤️',
  littleWays: "You take care of me in so many little ways, even when I don't ask you to.",
  iNotice: "I notice every little way you care for me, even the things you think I don't notice.",
  checkOnMe:
    'The way you check on me, remind me, help me, and look after me means more than you know.',
  didYouEat: 'Even your simple "Did you eat?" can mean so much when it comes from you.',
  smallestGestures: 'Sometimes your smallest gestures mean the most to me.',
  noBigDeal: 'I love the way you care without making a big deal out of it.',
  thingsYouForget: "I love the little things you do that you probably don't even remember doing.",
  nothingExtraordinary: "You don't have to do anything extraordinary to make me feel cared for.",
  whenYoureNotYourself:
    "I hope you know that I notice when you're tired, quiet, worried, or not yourself.",

  /* ── and how I want to take care of you ───────────────── the letters ── */

  iWantToTakeCareOfYou:
    'Just like you take care of me, I always want to take care of you in every little way I can.',
  yourHappinessMatters:
    'Your happiness, your health, your peace, and even the little things in your day matter to me.',
  countOnMe: 'I want to be someone you can always count on, just like I count on you.',
  lookAfterYouToo: 'Just as you look after me, I want to be there to look after you too.',
  standBesideYou:
    'I want to celebrate your happiness and stand beside you through your difficult days.',
  youHaveMe: "If you ever need someone, I hope you'll remember that you have me.",
  youDeserveCare: 'You deserve to be cared for just as much as you care for everyone else.',
  easierDays: 'I hope I can be one of the people who makes your difficult days a little easier.',
  someoneCares: 'I hope you always feel that you have someone who genuinely cares about you.',

  /* ── safe with you ──────────────────────────── chapter 2, chapter 4 ── */

  safestPerson: 'You have become one of the safest and most comfortable people in my life.',
  completelyMyself: 'With you, I can be completely myself without having to pretend.',
  andStillStayed:
    'You have seen my happy moments, my annoying moments, my emotional moments, and still stayed. ❤️',

  /* ── the ordinary days ─────────────────── chapter 2, the video archive ── */

  ordinaryDays: 'You somehow manage to make even ordinary days feel special.',
  chaoticDay:
    "If I had to choose one person to share a random, boring, chaotic day with, I'd still choose you.",
  neverRunOut: 'I hope we never run out of things to laugh about.',

  /* ── the photos themselves ────────────────────────────── chapter 3 ── */

  momentsYouWereThere:
    'Some of my favourite memories are simply the moments where you were there.',
  yourFaceInThem: 'Some of my happiest memories have your face somewhere in them. ❤️',
  notJustPictures:
    "When I look at our photos, I don't just see pictures; I see moments I never want to forget.",
  howTheyFelt:
    'Some photos are beautiful because of how they look, but my favourite ones are beautiful because of how they felt.',
  keepMomentsForever:
    'If I could keep some moments forever, many of them would have you in them.',
  keepCollecting:
    'I hope we keep collecting little memories that one day become our favourite ones.',

  /* ── grateful ─────────────────────── the gate, chapter 1, the finale ── */

  noSpecialOccasion:
    "I don't need a special occasion to appreciate you, but today gives me an excuse to say it all.",
  partOfMyStory: 'You have become a beautiful part of my story.',
  pathsCrossed: "I'm genuinely grateful that our paths crossed.",
  gladIMetYou: "Out of all the people I could have met, I'm so glad I met you.",
  gratefulForNow:
    "I don't know what the future holds, but I know I'm grateful that you're part of my present.",

  /* ── the ones that end it ──────────────────────────────── the finale ── */

  twoMen: 'There are two men I have loved and looked up to deeply in my life — my dad, and you. ❤️',
  myDadAndYou:
    'My dad will always hold the most special place in my heart, and you are the other man who has earned a very special place in it.',
  theWayITrustYou: "The way I trust you is something I don't take for granted.",
  earnedAPlace: 'You have earned a place in my life that not everyone gets to have.',
  everyHappiness: 'I hope life gives you every happiness you deserve.',
  neverDoubt:
    'I hope you never doubt how valuable you are to the people who truly care about you.',
  comeBackHere:
    'And if you ever forget, I hope you come back to this little corner of the internet and remember that someone cares about you deeply. ❤️',
  happyBirthday:
    'Happy birthday to my favourite person, my first best male friend, my constant, and one of the most precious people in my life. ❤️',
} as const

export type QuoteKey = keyof typeof q

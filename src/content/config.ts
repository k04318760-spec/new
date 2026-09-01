/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  START HERE.                                                     ║
 * ║  This is the only file you must edit. Everything else is         ║
 * ║  optional polish. See CONTENT.md for the full walkthrough.       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export const config = {
  /* ---------------------------------------------------------- the people */
  him: {
    name: 'Sakthi',
    /** Used once, in the finale headline. Keep it short. */
    shortName: 'Sakthi',
  },
  her: {
    name: 'Nivetha',
  },

  /* ------------------------------------------------------------ the gate
   * The first thing he sees: one question only he can answer.
   * Answers are compared lowercased with spaces/punctuation stripped,
   * so "Chweetu!" and "chweetu" both pass.
   * Set `enabled: false` to skip the gate entirely.
   */
  gate: {
    enabled: true,
    question: 'before I let you in —',
    subtitle: 'what do I always call you?',
    placeholder: 'you know this...',
    /** Any one of these unlocks it. */
    accept: ['kutty payya', 'maahh','maadu','pa'],
    wrongHints: [
      'nope. 😂',
      'seriously?',
      'we have known each other HOW long',
      "okay I'll give you one more try 👀",
    ],
    /** After this many misses, it lets him in anyway. Never trap him out. */
    mercyAfter: 4,
  },

  /* --------------------------------------------------------- the birthday
   * If `lockUntil` is set, the final gift box refuses to open before then
   * and shows a countdown instead. ISO string in HIS timezone.
   * Set to null to disable the lock.
   */
  birthday: {
    lockUntil: null as string | null, // e.g. '2026-09-14T00:00:00+05:30'
    lockedMessage: "it's not your birthday yet. 👀",
  },

  /* ------------------------------------------------------------- storage
   * Where his answers go. See DEPLOY.md for the 10-minute setup.
   * Leave a URL empty to disable that channel — answers are ALWAYS
   * saved on his device regardless, and the WhatsApp fallback always works.
   */
  storage: {
    /** Google Apps Script web-app URL. Primary channel + the Vault reads from it. */
    appsScriptUrl: 'https://script.google.com/macros/s/AKfycbz1utRA7-8Hiz0TWItwKkUESmSpNnnJTDuTsqnbqocQRHdS6lGPAIHYd-DuENiy5ktF/exec',
    /** Web3Forms / Formspree endpoint. Independent backup — emails you a copy. */
    backupFormUrl: '',
    /** Your number in international format, no +. Powers the "send her your answers" button. */
    whatsappNumber: '916369957845',
  },

  /* --------------------------------------------------------------- vault
   * Your private view of his answers: yoursite.com/#/vault
   * This passcode is NOT stored in the site — you type it, and it is sent
   * to Apps Script which refuses to return anything without it.
   * Set it in the Apps Script file, not here.
   */
  vault: {
    enabled: true,
  },

  /* ---------------------------------------------------------- link preview
   * What WhatsApp/iMessage show when you send him the link.
   * Deliberately says nothing. Do not spoil it here.
   */
  share: {
    title: 'open this. 👀',
    description: ' ',
  },

  /* -------------------------------------------------------------- feature
   * Turn parts off while you build, or if you run out of content.
   */
  features: {
    grain: true,
    letterbox: true,
    uiSounds: true,
    idleNudges: true,
    resumeProgress: true,
    /** Lets him record a 15s voice reply on the last question. */
    voiceReplies: false,
  },

  /** Roughly how long the whole thing takes. Shown once, on the intro. */
  runtime: '00:11:20',
} as const

export type Config = typeof config

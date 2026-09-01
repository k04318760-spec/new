import type { ChatSession } from './types'
import { config } from './config'
import { q } from './quotes'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE CONVERSATION — 15 questions across 4 curated rounds.           ║
 * ║                                                                      ║
 * ║  Round 1 — Easy / funny (Q1, Q11, Q13, Q14)                          ║
 * ║  Round 2 — “Be honest 👀” (Q2, Q3, Q4, Q5)                           ║
 * ║  Round 3 — Getting personal (Q6, Q7, Q10, Q12)                       ║
 * ║  Round 4 — No jokes now ❤️ (Q8, Q9, Q15)                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

export const chatSessions: ChatSession[] = [
  /* ══════════════════════════════════════════════════════════════════════
   *  ROUND 1 — Easy / funny (after the chaos chapter)
   * ══════════════════════════════════════════════════════════════════════ */
  {
    id: 'chat-01',
    code: 'CHAT 01',
    title: 'warming up',
    songId: 'song-main',
    nodes: [
      { kind: 'text', text: 'okay wait.' },
      { kind: 'text', text: 'stop scrolling for a second 😂', delay: 700 },
      { kind: 'pause', ms: 500 },
      { kind: 'text', text: 'before I show you the rest of it...' },
      { kind: 'text', text: 'I have some questions.', delay: 900 },
      { kind: 'text', text: 'nothing too serious. yet. 👀', delay: 800 },

      /* Q1 */
      {
        kind: 'question',
        id: 'q01_name_thought',
        prompt: [
          "let's start easy.",
          'what is the FIRST thing that comes to your mind when you hear my name?',
          'first thought. not the polite one. 👀',
        ],
        input: {
          type: 'text',
          placeholder: 'be honest...',
          minLength: 2,
        },
        reactions: {
          short: ['hm.', 'that is it? okay. 😂', 'saving that.'],
          long: ['okay you wrote a whole paragraph 🥹', 'I did not expect that much. saving it.'],
          any: ['hm. noted. 👀', "I'm saving that answer."],
        },
      },

      /* Q11 */
      {
        kind: 'question',
        id: 'q02_first_impression',
        prompt: ['okay next one 😂', 'what was your actual FIRST impression of me?'],
        input: {
          type: 'choice',
          options: [
            { id: 'innocent', label: 'quiet / innocent (lol)' },
            { id: 'trouble', label: 'troublemaker from day one 😂' },
            { id: 'intimidating', label: 'intimidating 👀' },
            { id: 'wanted_to_talk', label: 'someone I wanted to talk to' },
            { id: 'other', label: 'something else...', opensText: true },
          ],
        },
        reactions: {
          byOption: {
            innocent: ['innocent?? clearly you were deceived 😂', 'look at where we are now'],
            trouble: ['troublemaker?? I am an angel 😇', 'and yet you stayed!'],
            intimidating: ['intimidating? me?? 😂', 'fair enough tbh'],
            wanted_to_talk: ['aww 🥹', 'okay that is actually sweet'],
            other: ['okay go on, explain 😂', 'I am listening!'],
          },
        },
      },

      /* Q13 */
      {
        kind: 'question',
        id: 'q03_texts_first',
        prompt: 'who do you think texts or calls the other person first more often?',
        input: {
          type: 'choice',
          options: [
            { id: 'him', label: `me (${config.him.shortName})` },
            { id: 'her', label: `you (${config.her.name})` },
            { id: 'equal', label: '50-50 honestly' },
          ],
        },
        reactions: {
          byOption: {
            him: ['debatable... but I will give you credit 😂', 'sure sure 😌'],
            her: ['obviously. someone has to keep this friendship alive 😤', 'and do not forget it! 😂'],
            equal: ['a diplomatic answer 😂', 'fair enough!'],
          },
        },
      },

      /* Q14 */
      {
        kind: 'question',
        id: 'q04_stuck_24h',
        prompt: 'if we got stuck somewhere together for 24 hours, what do you think would happen? 😂',
        input: {
          type: 'choice',
          options: [
            { id: 'fight', label: 'we would fight within 10 minutes 💀' },
            { id: 'laugh', label: 'laugh until we cannot breathe 😂' },
            { id: 'gossip', label: 'gossip about everyone we know' },
            { id: 'pro_team', label: 'figure a way out like a pro duo 🤝' },
            { id: 'other', label: 'something else...', opensText: true },
          ],
        },
        reactions: {
          byOption: {
            fight: ['10 minutes is generous honestly 😂', 'and then make up 5 minutes later'],
            laugh: ['100% accurate 😂', 'our usual chaotic state tbh'],
            gossip: ['you know it 👀', 'spilling all the tea'],
            pro_team: ['dream team energy 😌✨', 'we would definitely survive'],
            other: ['tell me more 👀', 'I need all the details'],
          },
        },
      },
    ],
    outro: ['okay okay', 'not bad so far.', 'there is more I want to show you first.'],
  },

  /* ══════════════════════════════════════════════════════════════════════
   *  ROUND 2 — “Be honest 👀” (after the memories chapter)
   * ══════════════════════════════════════════════════════════════════════ */
  {
    id: 'chat-02',
    code: 'CHAT 02',
    title: 'be honest 👀',
    songId: 'song-main',
    nodes: [
      { kind: 'text', text: 'so.' },
      { kind: 'text', text: 'Round 2. 👀', delay: 700 },
      { kind: 'text', text: 'time to be honest now.', delay: 700 },

      /* Q2 */
      {
        kind: 'question',
        id: 'q05_best_friend',
        prompt: [
          'if someone asks you',
          '"who is your female best friend?"',
          'whose name comes to your mind FIRST? 👀',
        ],
        input: {
          type: 'choice',
          options: [
            { id: 'me', label: 'you 😌' },
            { id: 'other', label: 'someone else 👀' },
            { id: 'depends', label: "depends who's asking 😂" },
            { id: 'refuse', label: 'I refuse to answer' },
          ],
        },
        reactions: {
          byOption: {
            me: ['hmm.', 'correct answer detected. 😌❤️', 'good. that was the only right answer.'],
            other: ['interesting.', "we'll discuss this later. 👀😂", 'I am writing this down. with a pen.'],
            depends: ['coward. 😂', 'that is such a you answer'],
            refuse: ['SUSPICIOUS.', 'noted. and held against you. 👀'],
          },
        },
      },

      /* Q3 */
      {
        kind: 'question',
        id: 'q06_how_much_like',
        prompt: 'how much do you ACTUALLY like me? ❤️',
        input: {
          type: 'slider',
          leftEmoji: '🙂',
          rightEmoji: '❤️',
          labels: ['barely', 'a lot', 'too much?'],
          overshoot: true,
        },
        reactions: {
          byRange: [
            { min: 0, max: 20, lines: ['WOW.', 'okay. noted. 😐', 'drag it back up. now.'] },
            { min: 21, max: 55, lines: ['mid?? really??', 'okay we will work on that 😂'] },
            { min: 56, max: 85, lines: ['acceptable.', 'okay that is fair 😌'] },
            { min: 86, max: 100, lines: ['okay 🥹', 'that is very high. I am pretending to be normal about it.'] },
            { min: 101, max: 999, lines: ['you broke the slider.', 'okay that is enough 😂❤️', 'this is going in my screenshots folder.'] },
          ],
        },
      },

      /* Q4 */
      {
        kind: 'question',
        id: 'q07_like_most',
        prompt: 'what do you like most about me?',
        input: {
          type: 'choice',
          options: [
            { id: 'personality', label: 'your personality' },
            { id: 'craziness', label: 'your craziness 😂' },
            { id: 'caring', label: 'the way you care' },
            { id: 'smile', label: 'your smile' },
            { id: 'everything', label: 'everything 😌' },
            { id: 'other', label: 'something else...', opensText: true },
          ],
        },
        reactions: {
          byOption: {
            craziness: ['of course. 😂', 'that is not a compliment but I accept it'],
            everything: ['okay calm down 😳', 'that is a very safe answer. I am watching you.'],
            other: ['okay THAT one I did not expect. 🥹'],
          },
          any: [q.notJustSomeoneITalkTo],
        },
      },

      /* Q5 */
      {
        kind: 'question',
        id: 'q08_secretly_like_annoyance',
        prompt: [
          'okay last one for this round 😂',
          'what is something about me that annoys you… but you secretly like?',
        ],
        input: {
          type: 'text',
          placeholder: 'tell the truth 👀...',
          multiline: true,
        },
        reactions: {
          short: ['hm. I see you 👀', 'I knew it 😂'],
          long: ['wow okay you had that ready 😂', 'saving that one forever 🥹'],
          any: ['haha I knew you secretly loved that 😂', 'noted! 📝'],
        },
      },
    ],
    outro: ['okay.', 'you survived Round 2.', "let's keep going. 🔓"],
  },

  /* ══════════════════════════════════════════════════════════════════════
   *  ROUND 3 — Getting personal (after the video archive)
   * ══════════════════════════════════════════════════════════════════════ */
  {
    id: 'chat-03',
    code: 'CHAT 03',
    title: 'getting personal',
    songId: 'song-main',
    nodes: [
      { kind: 'text', text: 'hey.' },
      { kind: 'pause', ms: 700 },
      { kind: 'text', text: 'now things get a little more real.' },
      { kind: 'text', text: 'no dodging these questions. 👀', delay: 700 },

      /* Q6 */
      {
        kind: 'question',
        id: 'q09_miss_most',
        prompt: [
          'if I disappeared from your daily life for one week...',
          'what would you miss the most?',
        ],
        input: {
          type: 'text',
          placeholder: 'take your time.',
          multiline: true,
        },
        reactions: {
          short: ['okay that was short. but I get it.', 'hm. saving it.'],
          long: ['okay. 🥹', 'I read that twice.', 'that one is staying with me.'],
          any: [q.youHaveMe],
        },
      },

      /* Q7 */
      {
        kind: 'question',
        id: 'q10_understands_best',
        prompt: [
          'if someone asked you,',
          '"who understands you the best?"',
          'would my name come to your mind?',
        ],
        input: {
          type: 'choice',
          options: [
            { id: 'always', label: 'always, without a doubt ❤️' },
            { id: 'mostly', label: 'yes, most of the time 😌' },
            { id: 'sometimes', label: 'sometimes, when you are not annoying me 😂' },
            { id: 'deflect', label: "let's not get emotional yet 👀" },
          ],
        },
        reactions: {
          byOption: {
            always: ['okay that actually made my heart melt 🥹❤️', 'I will always be that person for you.'],
            mostly: ['that means a lot 😌', 'glad I get you'],
            sometimes: ['hey! 😂', 'I can be both annoying and understanding 😤'],
            deflect: ['too late, we are in deep now 👀', 'you cannot escape!'],
          },
        },
      },

      /* Q10 */
      {
        kind: 'question',
        id: 'q11_favourite_memory',
        prompt: [
          'what is your favourite memory with me?',
          'the actual one. not the polite one.',
        ],
        input: {
          type: 'text',
          placeholder: 'the first one you thought of.',
          multiline: true,
        },
        reactions: {
          any: ['I was hoping you would say something like that.', 'okay. 🥹', 'I remember that one too.'],
          long: ['you remembered all of that. 🥹'],
        },
      },

      /* Q12 */
      {
        kind: 'question',
        id: 'q12_became_important',
        prompt: [
          'when did you realize that I had become important to you?',
          'was there a specific moment?',
        ],
        input: {
          type: 'text',
          placeholder: 'tell me...',
          multiline: true,
        },
        reactions: {
          any: ['that means more to me than you know 🥹', 'saving this forever ❤️'],
          long: ['reading this made me so happy 🥹❤️'],
        },
      },
    ],
    outro: [
      'okay.',
      'I wrote you something before we finish.',
      'open them when you are ready. 💌',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════════
   *  ROUND 4 — No jokes now ❤️ (after the letters, before montage)
   * ══════════════════════════════════════════════════════════════════════ */
  {
    id: 'chat-04',
    code: 'CHAT 04',
    title: 'no jokes now ❤️',
    songId: 'song-main',
    nodes: [
      { kind: 'text', text: 'okay.' },
      { kind: 'pause', ms: 1000 },
      { kind: 'text', text: 'last round.' },
      { kind: 'text', text: 'no jokes now. ❤️', delay: 900 },

      /* Q8 */
      {
        kind: 'question',
        id: 'q13_what_i_mean',
        prompt: ['what do you think I mean to you? ❤️', 'take your time.'],
        input: {
          type: 'text',
          placeholder: 'in your own words...',
          multiline: true,
        },
        reactions: {
          any: ['thank you for saying that 🥹❤️', 'you have no idea how much that means.'],
          long: ['I am definitely screenshotting this 🥹❤️'],
        },
      },

      /* Q9 */
      {
        kind: 'question',
        id: 'q14_who_is_nive',
        prompt: [
          'if someone asked you...',
          `"who is ${config.her.name} to you?"`,
          'what would you say?',
        ],
        input: {
          type: 'text',
          placeholder: 'take as long as you want.',
          multiline: true,
          minLength: 2,
        },
        reactions: {
          any: [q.nameHasAPlace],
        },
      },

      /* Q15 */
      {
        kind: 'question',
        id: 'q15_hope_never_changes',
        prompt: [
          'and finally...',
          'what is one thing about me that you hope never changes?',
        ],
        input: {
          type: 'text',
          placeholder: 'the one thing that is purely me.',
          multiline: true,
        },
        reactions: {
          any: ['I promise I will never lose that ❤️', 'I will always be here for you. 🥹'],
          long: ['this is the sweetest thing 🥹❤️'],
        },
      },
    ],
    outro: ['okay.', 'there is one last thing I wanted you to see.'],
  },
]

/* ----------------------------------------------------------------- helpers */

export const sessionById = (id: string) => chatSessions.find((s) => s.id === id)

/** Every question node, flattened — used by the Vault and the score. */
export const allQuestions = chatSessions.flatMap((s) =>
  s.nodes
    .filter((n): n is Extract<typeof n, { kind: 'question' }> => n.kind === 'question')
    .map((n) => ({ ...n, sessionId: s.id }))
)

export const scoredQuestionCount = allQuestions.filter((q) => q.scored).length

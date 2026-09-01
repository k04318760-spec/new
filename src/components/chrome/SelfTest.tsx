import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { config } from '@/content/config'
import {
  flushUntilEmpty,
  recordAnswer,
  recordEvent,
  pendingCount,
  getLocalAnswers,
  getLastTransportError,
} from '@/lib/answerStore'

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  yoursite.com/?selftest=1                                            ║
 * ║                                                                      ║
 * ║  Run this BEFORE you send him the link.                              ║
 * ║                                                                      ║
 * ║  It pushes a fake answer all the way through the real pipeline and   ║
 * ║  tells you whether it landed. Finding out afterwards that answers    ║
 * ║  were never being saved is the one failure that cannot be undone.    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

type Check = { label: string; state: 'run' | 'pass' | 'fail'; detail?: string }

export function SelfTest() {
  const [checks, setChecks] = useState<Check[] | null>(null)

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('selftest')) return

    const run = async () => {
      const results: Check[] = []
      const push = (c: Check) => {
        results.push(c)
        setChecks([...results])
      }

      /* 1 — can this browser store anything at all? */
      try {
        localStorage.setItem('bd.selftest', '1')
        localStorage.removeItem('bd.selftest')
        push({ label: 'Local storage on his device', state: 'pass' })
      } catch {
        push({
          label: 'Local storage on his device',
          state: 'fail',
          detail: 'Private browsing blocks it. Answers will rely on the network alone.',
        })
      }

      /* 2 — is a destination even configured? */
      if (!config.storage.appsScriptUrl) {
        push({
          label: 'Apps Script URL set in config.ts',
          state: 'fail',
          detail: 'storage.appsScriptUrl is empty — nothing will reach your sheet.',
        })
      } else {
        push({ label: 'Apps Script URL set in config.ts', state: 'pass' })

        /* 3 — is it reachable and deployed as "Anyone"? */
        push({ label: 'Reaching your Google Sheet', state: 'run' })
        let pinged: { alive?: boolean; sheetBound?: boolean | null; sheetName?: string } = {}
        try {
          const res = await fetch(`${config.storage.appsScriptUrl}?action=ping`, { redirect: 'follow' })
          pinged = await res.json()
          results[results.length - 1] =
            pinged.alive
              ? { label: 'Reaching your Google Sheet', state: 'pass' }
              : {
                  label: 'Reaching your Google Sheet',
                  state: 'fail',
                  detail: 'Responded, but not with what we expected. Re-deploy the script.',
                }
        } catch {
          results[results.length - 1] = {
            label: 'Reaching your Google Sheet',
            state: 'fail',
            detail:
              'Blocked. Check Deploy → "Who has access" is set to Anyone, and that you copied the /exec URL.',
          }
        }
        setChecks([...results])

        /**
         * Responding and being able to write are different things. This is
         * the one that catches a standalone script — it answers happily and
         * then has no spreadsheet to put anything in.
         */
        if (pinged.alive) {
          push(
            pinged.sheetBound === false
              ? {
                  label: 'Script is attached to a Sheet',
                  state: 'fail',
                  detail:
                    'The script responds but has no spreadsheet. It was made as a standalone project. Open your Google Sheet → Extensions → Apps Script, paste Code.gs there, and deploy from that one instead.',
                }
              : pinged.sheetBound === true
                ? {
                    label: 'Script is attached to a Sheet',
                    state: 'pass',
                    detail: pinged.sheetName ? `Writing into "${pinged.sheetName}".` : undefined,
                  }
                : {
                    label: 'Script is attached to a Sheet',
                    state: 'fail',
                    detail:
                      'Your deployed script is an older version that cannot report this. Re-deploy: Deploy → Manage deployments → ✏️ → New version.',
                  }
          )
        }
      }

      /* 4 — a real write, through the real code path. */
      push({ label: 'Writing a test answer', state: 'run' })
      recordAnswer({
        questionId: '__selftest',
        question: 'SELF TEST — you can delete this row',
        sessionCode: 'TEST',
        value: `test at ${new Date().toLocaleTimeString()}`,
        raw: 'test',
        correct: null,
        secondsTaken: 0,
      })
      recordEvent('selftest')

      // Drain properly. recordAnswer already kicked off a flush of its own,
      // so a single await can return before the newest item has even been
      // attempted — and then report a failure that never happened.
      await flushUntilEmpty()

      const landed = pendingCount() === 0 && !!config.storage.appsScriptUrl
      results[results.length - 1] = landed
        ? { label: 'Writing a test answer', state: 'pass', detail: 'Check your sheet — a TEST row should be there.' }
        : {
            label: 'Writing a test answer',
            state: 'fail',
            // Show what the server actually said. "Queued but not delivered"
            // on its own tells you nothing about which of five things broke.
            detail:
              `Not delivered. ${pendingCount()} item(s) queued — they retry on their own.` +
              (getLastTransportError() ? `

The script replied: ${getLastTransportError()}` : ''),
          }
      setChecks([...results])

      /* 5 — the fallback that needs no server at all. */
      push(
        config.storage.whatsappNumber
          ? { label: 'WhatsApp fallback ready', state: 'pass' }
          : {
              label: 'WhatsApp fallback ready',
              state: 'fail',
              detail: 'storage.whatsappNumber is empty. Set it so he can send answers by hand if all else fails.',
            }
      )

      push({
        label: 'Answers currently on this device',
        state: 'pass',
        detail: `${getLocalAnswers().length} stored locally.`,
      })
    }

    void run()
  }, [])

  if (!checks) return null

  const allGood = checks.every((c) => c.state === 'pass')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 px-5 py-10 backdrop-blur">
      <div className="w-full max-w-lg">
        <p className="stencil">storage self-test</p>
        <h1 className="mt-2 font-display text-3xl text-bone">
          {allGood ? 'Everything works. ✅' : 'Something needs fixing.'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {allGood
            ? 'His answers will reach you. Safe to send him the link.'
            : 'Fix the red rows before sending him the link — see DEPLOY.md.'}
        </p>

        <ul className="mt-8 space-y-4">
          {checks.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 shrink-0">
                {c.state === 'run' && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden />}
                {c.state === 'pass' && <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden />}
                {c.state === 'fail' && <XCircle className="h-4 w-4 text-ember" aria-hidden />}
              </span>
              <span>
                <span className="text-[15px] text-bone">{c.label}</span>
                {c.detail && (
                  <span className="mt-1 block whitespace-pre-line break-words text-xs leading-relaxed text-muted">
                    {c.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <a
          href={window.location.pathname}
          className="tap-target mt-10 inline-flex items-center rounded-full border border-ink-4 px-6
                     text-sm text-bone-dim transition-colors hover:border-gold/40 hover:text-bone"
        >
          leave the test and open the site
        </a>
      </div>
    </div>
  )
}

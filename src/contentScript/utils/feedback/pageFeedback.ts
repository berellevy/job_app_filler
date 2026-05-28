import {
  FeedbackRuntimeMessage,
  FeedbackSubmitResponse,
} from '@src/shared/utils/feedback/messages'
import {
  buildFeedbackTarget,
  FeedbackTarget,
} from '@src/shared/utils/feedback/pageTarget'

interface StartPageFeedbackOptions {
  version: string
  candidateEmail: string | null
}

let activeSession: PageFeedbackSession | null = null

export function startPageFeedback(options: StartPageFeedbackOptions): void {
  activeSession?.destroy()
  activeSession = new PageFeedbackSession(options, () => {
    activeSession = null
  })
  activeSession.start()
}

class PageFeedbackSession {
  private banner: HTMLDivElement | null = null
  private highlight: HTMLDivElement | null = null
  private overlay: HTMLDivElement | null = null
  private target: FeedbackTarget | null = null

  constructor(
    private readonly options: StartPageFeedbackOptions,
    private readonly onDone: () => void
  ) {}

  start(): void {
    injectStyles()
    document.documentElement.classList.add('hsfb-ext-picking')

    this.banner = document.createElement('div')
    this.banner.className = 'hsfb-ext-pick-banner'
    this.banner.textContent = 'Click the element you want to report - Esc to cancel'
    document.body.appendChild(this.banner)

    this.highlight = document.createElement('div')
    this.highlight.className = 'hsfb-ext-highlight'
    document.body.appendChild(this.highlight)

    document.addEventListener('mousemove', this.onMove, true)
    document.addEventListener('click', this.onPick, true)
    document.addEventListener('keydown', this.onKey, true)
  }

  destroy(): void {
    this.stopPicking()
    this.overlay?.remove()
    this.overlay = null
    this.onDone()
  }

  private readonly onMove = (event: MouseEvent): void => {
    const el = this.elementUnder(event)
    if (!el || !this.highlight) return
    const rect = el.getBoundingClientRect()
    this.highlight.style.left = `${rect.left}px`
    this.highlight.style.top = `${rect.top}px`
    this.highlight.style.width = `${rect.width}px`
    this.highlight.style.height = `${rect.height}px`
  }

  private readonly onPick = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()

    const el = this.elementUnder(event)
    if (!el) return

    this.target = buildFeedbackTarget(el)
    this.stopPicking()
    this.showCompose()
  }

  private readonly onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.destroy()
    }
  }

  private stopPicking(): void {
    document.documentElement.classList.remove('hsfb-ext-picking')
    document.removeEventListener('mousemove', this.onMove, true)
    document.removeEventListener('click', this.onPick, true)
    document.removeEventListener('keydown', this.onKey, true)
    this.banner?.remove()
    this.highlight?.remove()
    this.banner = null
    this.highlight = null
  }

  private showCompose(): void {
    const targetText = this.target?.text || '(no text)'
    const targetSelector = this.target?.selector || ''

    this.overlay = document.createElement('div')
    this.overlay.className = 'hsfb-ext-overlay open'
    this.overlay.innerHTML = `
      <div class="hsfb-ext-modal" role="dialog" aria-modal="true" aria-label="Send feedback">
        <h2>Send feedback</h2>
        <p>Tell us what's broken, confusing, or missing.</p>
        <div class="hsfb-ext-target">
          You flagged: <strong>${escapeHtml(targetText)}</strong>
          <code>${escapeHtml(targetSelector)}</code>
        </div>
        <textarea placeholder="What is broken on this page?" aria-label="Your feedback"></textarea>
        <div class="hsfb-ext-status" role="status"></div>
        <div class="hsfb-ext-row">
          <button class="hsfb-ext-cancel" type="button">Cancel</button>
          <button class="hsfb-ext-submit" type="button">Send</button>
        </div>
      </div>
    `
    document.body.appendChild(this.overlay)

    const textarea = this.overlay.querySelector('textarea') as HTMLTextAreaElement
    const cancel = this.overlay.querySelector('.hsfb-ext-cancel') as HTMLButtonElement
    const submit = this.overlay.querySelector('.hsfb-ext-submit') as HTMLButtonElement
    const status = this.overlay.querySelector('.hsfb-ext-status') as HTMLDivElement

    textarea.focus()
    cancel.addEventListener('click', () => this.destroy())
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) this.destroy()
    })
    submit.addEventListener('click', () => {
      void this.submit(textarea, submit, status)
    })
  }

  private async submit(
    textarea: HTMLTextAreaElement,
    submit: HTMLButtonElement,
    status: HTMLDivElement
  ): Promise<void> {
    const message = textarea.value.trim()
    if (message.length < 3) {
      status.textContent = 'Please write at least a few words.'
      status.classList.add('err')
      status.style.display = 'block'
      return
    }

    submit.disabled = true
    status.style.display = 'none'
    status.classList.remove('err')

    const response = await sendFeedback({
      type: 'HS_FEEDBACK_SUBMIT',
      payload: {
        message,
        userId: null,
        email: this.options.candidateEmail,
        url: location.href,
        target: this.target,
        metadata: {
          kind: 'pick',
          surface: 'extension-page-picker',
          source: 'chrome-extension',
          extension_version: this.options.version,
          candidate_email: this.options.candidateEmail,
          active_tab_url: location.href,
        },
      },
    })

    if (!response.ok) {
      submit.disabled = false
      status.textContent = response.error || 'Could not send. Please try again.'
      status.classList.add('err')
      status.style.display = 'block'
      return
    }

    status.textContent = 'Thanks - feedback received.'
    status.style.display = 'block'
    textarea.value = ''
    window.setTimeout(() => this.destroy(), 1200)
  }

  private elementUnder(event: MouseEvent): Element | null {
    const path = event.composedPath ? event.composedPath() : [event.target]
    for (const node of path) {
      if (!(node instanceof Element)) continue
      if (
        node.closest(
          '.hsfb-ext-pick-banner,.hsfb-ext-highlight,.hsfb-ext-overlay'
        )
      ) {
        return null
      }
      return node
    }
    return null
  }
}

function sendFeedback(
  message: Extract<FeedbackRuntimeMessage, { type: 'HS_FEEDBACK_SUBMIT' }>
): Promise<FeedbackSubmitResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: FeedbackSubmitResponse | undefined) => {
      const runtimeErr = chrome.runtime.lastError
      if (runtimeErr) {
        resolve({ ok: false, error: runtimeErr.message })
        return
      }
      resolve(response || { ok: false, error: 'No response from background.' })
    })
  })
}

let stylesInjected = false

function injectStyles(): void {
  if (stylesInjected) return
  stylesInjected = true
  const style = document.createElement('style')
  style.textContent = `
    .hsfb-ext-picking * { cursor: crosshair !important; }
    .hsfb-ext-pick-banner { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 2147483647; background: #111; color: #fff; padding: 10px 18px; border-radius: 9999px; font: 600 13px/1 system-ui,-apple-system,sans-serif; box-shadow: 0 8px 28px rgba(0,0,0,.4); }
    .hsfb-ext-highlight { position: fixed; pointer-events: none; border: 2px solid #f43f5e; background: rgba(244,63,94,.12); border-radius: 4px; z-index: 2147483645; transition: all .08s ease; }
    .hsfb-ext-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 2147483647; display: none; align-items: center; justify-content: center; }
    .hsfb-ext-overlay.open { display: flex; }
    .hsfb-ext-modal { background: #fff; border-radius: 14px; width: min(460px, calc(100vw - 32px)); padding: 24px; font: 14px/1.45 system-ui,-apple-system,sans-serif; color: #111; box-shadow: 0 24px 60px rgba(0,0,0,.3); }
    .hsfb-ext-modal h2 { margin: 0 0 4px; font-size: 18px; letter-spacing: 0; }
    .hsfb-ext-modal p { margin: 0 0 12px; color: #555; font-size: 13px; }
    .hsfb-ext-target { margin: 0 0 12px; padding: 10px; border: 1px dashed #d4d4d8; border-radius: 8px; background: #fafafa; font-size: 12px; color: #333; }
    .hsfb-ext-target code { display: block; font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 11px; color: #555; margin-top: 4px; word-break: break-all; }
    .hsfb-ext-modal textarea { width: 100%; box-sizing: border-box; min-height: 120px; padding: 10px; border: 1px solid #d4d4d8; border-radius: 8px; font: inherit; resize: vertical; }
    .hsfb-ext-row { display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end; }
    .hsfb-ext-row button { padding: 10px 14px; border-radius: 8px; font: 600 13px/1 inherit; cursor: pointer; border: 0; }
    .hsfb-ext-cancel { background: #f4f4f5; color: #111; }
    .hsfb-ext-submit { background: #111; color: #fff; }
    .hsfb-ext-submit[disabled] { opacity: .5; cursor: wait; }
    .hsfb-ext-status { margin-top: 10px; font-size: 12px; color: #16a34a; display: none; }
    .hsfb-ext-status.err { color: #dc2626; }
  `
  document.head.appendChild(style)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] || c))
}

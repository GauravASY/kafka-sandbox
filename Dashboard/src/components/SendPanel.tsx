import { History, Loader2, Send } from 'lucide-react'
import { useRef, useState } from 'react'

import { publish } from '../lib/api'
import { TOPIC_THEME } from '../lib/topics'
import { formatClockTime, localId } from '../lib/time'
import { TOPICS } from '../types'
import type { SentRecord, Topic, ToastKind } from '../types'

import { TopicBadge } from './TopicBadge'

const HISTORY_LIMIT = 10

type Props = {
  onToast: (kind: ToastKind, title: string, detail?: string) => void
}

export function SendPanel({ onToast }: Props) {
  const [topic, setTopic] = useState<Topic>('alerts')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<SentRecord[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmed = message.trim()
  const canSend = trimmed.length > 0 && !sending

  async function handleSend() {
    if (!canSend) return
    setSending(true)
    try {
      await publish(topic, trimmed)
      setHistory((current) =>
        [
          { id: localId('s'), topic, text: trimmed, sentAt: Date.now() },
          ...current,
        ].slice(0, HISTORY_LIMIT),
      )
      setMessage('')
      onToast('success', `Published to ${topic}`, trimmed)
      textareaRef.current?.focus()
    } catch (error) {
      onToast(
        'error',
        'Publish failed',
        error instanceof Error ? error.message : 'Unknown error',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section
        className="rounded-xl border border-white/8 bg-ink-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur-sm"
        aria-labelledby="send-heading"
      >
        <header className="mb-4">
          <h2
            id="send-heading"
            className="text-sm font-semibold tracking-tight text-neutral-100"
          >
            Send notification
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Publishes one message onto a Kafka topic.
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleSend()
          }}
          className="flex flex-col gap-4"
        >
          <fieldset className="min-w-0">
            <legend className="mb-2 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
              Topic
            </legend>
            <div
              className="grid grid-cols-2 gap-1.5 rounded-lg border border-white/6 bg-ink-950/60 p-1.5"
              role="group"
              aria-label="Topic"
            >
              {TOPICS.map((option) => {
                const active = option === topic
                const theme = TOPIC_THEME[option]
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTopic(option)}
                    aria-pressed={active}
                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? theme.segmentActive
                        : 'border-transparent text-neutral-500 hover:bg-white/4 hover:text-neutral-300'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full transition-opacity ${theme.dot} ${
                        active ? 'opacity-100' : 'opacity-40'
                      }`}
                      aria-hidden="true"
                    />
                    {theme.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="min-w-0">
            <label
              htmlFor="message"
              className="mb-2 block text-[11px] font-medium tracking-wider text-neutral-500 uppercase"
            >
              Message
            </label>
            <textarea
              id="message"
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault()
                  void handleSend()
                }
              }}
              rows={4}
              placeholder="Your order has shipped…"
              className="w-full resize-y rounded-lg border border-white/8 bg-ink-950/60 px-3 py-2.5 text-[13px] leading-relaxed text-neutral-100 transition-colors placeholder:text-neutral-600 hover:border-white/12"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] text-neutral-600">
              <kbd className="font-sans">⌘</kbd>
              <kbd className="font-sans">↵</kbd> to send
            </p>
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-100 px-4 py-2 text-[13px] font-semibold text-ink-950 transition-all duration-150 hover:bg-white disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-ink-800 disabled:text-neutral-600"
            >
              {sending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-3.5" aria-hidden="true" />
              )}
              {sending ? 'Sending' : 'Send'}
            </button>
          </div>
        </form>
      </section>

      <section
        className="rounded-xl border border-white/8 bg-ink-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur-sm"
        aria-labelledby="history-heading"
      >
        <header className="mb-3 flex items-center gap-2">
          <History className="size-3.5 text-neutral-600" aria-hidden="true" />
          <h2
            id="history-heading"
            className="text-sm font-semibold tracking-tight text-neutral-100"
          >
            Sent history
          </h2>
          <span className="font-mono text-[10px] text-neutral-600 tabular-nums">
            last {HISTORY_LIMIT}
          </span>
        </header>

        {history.length === 0 ? (
          <p className="py-3 text-xs text-neutral-600">Nothing sent yet.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-white/5">
            {history.map((record) => (
              <li
                key={record.id}
                className="animate-feed-in flex items-start gap-2.5 py-2 first:pt-0 last:pb-0"
              >
                <TopicBadge topic={record.topic} className="mt-0.5" />
                <p className="min-w-0 flex-1 truncate text-[13px] text-neutral-300">
                  {record.text}
                </p>
                <time
                  className="shrink-0 font-mono text-[10px] text-neutral-600 tabular-nums"
                  dateTime={new Date(record.sentAt).toISOString()}
                >
                  {formatClockTime(record.sentAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

import { Eraser, Lock, Plug, PlugZap, Trash2, TriangleAlert } from 'lucide-react'
import { useId, useState } from 'react'

import { useUserSocket } from '../hooks/useUserSocket'
import { TOPIC_THEME } from '../lib/topics'
import { TOPICS } from '../types'
import type { ConnectionStatus, SimUser, Topic } from '../types'

import { NotificationItem } from './NotificationItem'

const STATUS_META: Record<
  ConnectionStatus,
  { label: string; dot: string; text: string }
> = {
  disconnected: {
    label: 'Disconnected',
    dot: 'bg-neutral-600',
    text: 'text-neutral-500',
  },
  connecting: {
    label: 'Connecting',
    dot: 'bg-amber-400 text-amber-400 animate-pulse-ring',
    text: 'text-amber-300',
  },
  connected: {
    label: 'Connected',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
  },
}

type Props = {
  user: SimUser
  onIdChange: (key: string, id: string) => void
  onRemove: (key: string) => void
}

export function UserCard({ user, onIdChange, onRemove }: Props) {
  const [topics, setTopics] = useState<Topic[]>([...TOPICS])
  const socket = useUserSocket(user.id, topics)
  const idFieldId = useId()
  const feedId = useId()

  const live = socket.status !== 'disconnected'
  const status = STATUS_META[socket.status]
  const canConnect = user.id.trim().length > 0 && topics.length > 0

  function toggleTopic(topic: Topic) {
    setTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : TOPICS.filter((item) => item === topic || current.includes(item)),
    )
  }

  return (
    <article className="flex flex-col rounded-xl border border-white/8 bg-ink-900/70 shadow-xl shadow-black/40 backdrop-blur-sm">
      <header className="flex items-center gap-2.5 border-b border-white/6 px-4 py-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={idFieldId} className="sr-only">
            User ID
          </label>
          <input
            id={idFieldId}
            value={user.id}
            onChange={(event) => onIdChange(user.key, event.target.value)}
            disabled={live}
            spellCheck={false}
            autoComplete="off"
            placeholder="user-id"
            className="w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1 font-mono text-[13px] font-medium text-neutral-100 transition-colors hover:border-white/10 hover:bg-ink-950/50 focus:border-white/10 focus:bg-ink-950/50 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:border-transparent disabled:hover:bg-transparent"
          />
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium ${status.text}`}
          role="status"
        >
          <span
            className={`size-1.5 rounded-full ${status.dot}`}
            aria-hidden="true"
          />
          {status.label}
        </span>

        <button
          type="button"
          onClick={() => onRemove(user.key)}
          className="shrink-0 rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          aria-label={`Remove ${user.id || 'user'}`}
          title="Remove user"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3">
        <fieldset
          className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2"
          disabled={live}
        >
          <legend className="sr-only">Subscribed topics</legend>
          {TOPICS.map((topic) => {
            const theme = TOPIC_THEME[topic]
            return (
              <label
                key={topic}
                className={`flex cursor-pointer items-center gap-2 text-[13px] transition-colors select-none ${
                  live
                    ? 'cursor-not-allowed text-neutral-500'
                    : 'text-neutral-300 hover:text-neutral-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={topics.includes(topic)}
                  onChange={() => toggleTopic(topic)}
                  disabled={live}
                  className={`size-3.5 cursor-pointer appearance-none rounded border border-white/15 bg-ink-950 transition-all checked:border-current checked:bg-current disabled:cursor-not-allowed ${theme.checkbox}`}
                />
                <span className="font-mono text-xs">{theme.label}</span>
              </label>
            )
          })}
        </fieldset>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {live ? (
            <button
              type="button"
              onClick={socket.disconnect}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Plug className="size-3.5" aria-hidden="true" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={socket.connect}
              disabled={!canConnect}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:border-white/8 disabled:bg-ink-800 disabled:text-neutral-600"
              title={
                canConnect ? undefined : 'Pick a user ID and at least one topic'
              }
            >
              <PlugZap className="size-3.5" aria-hidden="true" />
              Connect
            </button>
          )}
        </div>

        {live ? (
          <p className="flex w-full items-center gap-1.5 text-[11px] text-neutral-600">
            <Lock className="size-3" aria-hidden="true" />
            Subscriptions are fixed by the socket URL — disconnect to change
            them.
          </p>
        ) : null}

        {socket.dropped ? (
          <p className="flex w-full items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/8 px-2 py-1.5 text-[11px] text-amber-300">
            <TriangleAlert className="size-3 shrink-0" aria-hidden="true" />
            Socket dropped. Connect again to resume the feed.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-white/6 px-4 py-2.5">
        <h3 className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
          Feed
        </h3>
        {socket.unread > 0 ? (
          <button
            type="button"
            onClick={socket.markAllRead}
            className="rounded-full border border-sky-500/30 bg-sky-500/15 px-1.5 py-px font-mono text-[10px] font-medium text-sky-300 tabular-nums transition-colors hover:bg-sky-500/25"
            title="Mark as read"
          >
            {socket.unread} new
          </button>
        ) : null}
        <span className="font-mono text-[10px] text-neutral-600 tabular-nums">
          {socket.notifications.length} total
        </span>
        <button
          type="button"
          onClick={socket.clear}
          disabled={socket.notifications.length === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-200 disabled:cursor-not-allowed disabled:text-neutral-700 disabled:hover:bg-transparent"
        >
          <Eraser className="size-3" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="px-4 pt-1 pb-4">
        <ul
          id={feedId}
          className="scroll-slim flex max-h-72 flex-col gap-2 overflow-y-auto"
          aria-live="polite"
          aria-relevant="additions"
          aria-label={`Notifications for ${user.id || 'user'}`}
        >
          {socket.notifications.length === 0 ? (
            <li className="rounded-lg border border-dashed border-white/8 px-3 py-6 text-center text-xs text-neutral-600">
              {socket.status === 'connected'
                ? 'Listening. Send a message to see it arrive.'
                : 'Connect to start receiving notifications.'}
            </li>
          ) : (
            socket.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </ul>
      </div>
    </article>
  )
}

import { TOPIC_THEME } from '../lib/topics'
import { formatClockTime, formatRelative, useClock } from '../lib/time'
import type { Notification } from '../types'

import { TopicBadge } from './TopicBadge'

type Props = {
  notification: Notification
}

export function NotificationItem({ notification }: Props) {
  const now = useClock()
  const theme = TOPIC_THEME[notification.topic]

  return (
    <li className="animate-feed-in relative overflow-hidden rounded-lg border border-white/6 bg-ink-850/80 py-2.5 pr-3 pl-3.5">
      <span
        className={`absolute inset-y-0 left-0 w-[2px] ${theme.rail}`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <TopicBadge topic={notification.topic} className="mt-0.5" />
        <time
          className="shrink-0 font-mono text-[10px] text-neutral-500 tabular-nums"
          dateTime={new Date(notification.receivedAt).toISOString()}
          title={formatClockTime(notification.receivedAt)}
        >
          {formatRelative(notification.receivedAt, now)}
        </time>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed break-words text-neutral-200">
        {notification.text}
      </p>
    </li>
  )
}

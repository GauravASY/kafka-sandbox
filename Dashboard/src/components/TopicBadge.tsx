import { TOPIC_THEME } from '../lib/topics'
import type { Topic } from '../types'

type Props = {
  topic: Topic
  className?: string
}

export function TopicBadge({ topic, className = '' }: Props) {
  const theme = TOPIC_THEME[topic]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[10px] leading-4 font-medium tracking-wide uppercase ${theme.badge} ${className}`}
    >
      <span className={`size-1 rounded-full ${theme.dot}`} aria-hidden="true" />
      {theme.label}
    </span>
  )
}

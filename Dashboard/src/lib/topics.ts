import type { Topic } from '../types'

type TopicTheme = {
  label: string
  /** Badge + dot surfaces. */
  badge: string
  dot: string
  /** Segmented-control look when this topic is the active one. */
  segmentActive: string
  /** Left hairline on a feed row. */
  rail: string
  checkbox: string
}

export const TOPIC_THEME: Record<Topic, TopicTheme> = {
  alerts: {
    label: 'alerts',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
    segmentActive:
      'bg-gradient-to-b from-amber-500/20 to-rose-500/10 text-amber-200 border-amber-500/40 shadow-[inset_0_1px_0_0_rgba(251,191,36,0.25)]',
    rail: 'bg-amber-500/60',
    checkbox: 'text-amber-400 focus-visible:outline-amber-400/70',
  },
  promotional: {
    label: 'promotional',
    badge: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    dot: 'bg-violet-400',
    segmentActive:
      'bg-gradient-to-b from-violet-500/20 to-indigo-500/10 text-violet-200 border-violet-500/40 shadow-[inset_0_1px_0_0_rgba(167,139,250,0.25)]',
    rail: 'bg-violet-500/60',
    checkbox: 'text-violet-400 focus-visible:outline-violet-400/70',
  },
}

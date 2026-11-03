import { useSyncExternalStore } from 'react'

const subscribers = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(onChange: () => void) {
  subscribers.add(onChange)
  if (timer === undefined) {
    timer = setInterval(() => {
      for (const notify of subscribers) notify()
    }, 1000)
  }
  return () => {
    subscribers.delete(onChange)
    if (subscribers.size === 0 && timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

/** Seconds-granularity clock shared by every relative timestamp on the page. */
function getSnapshot() {
  return Math.floor(Date.now() / 1000)
}

export function useClock(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** "just now", "12s ago", "4m ago", "2h ago". */
export function formatRelative(timestamp: number, nowSeconds: number): string {
  const seconds = Math.max(0, nowSeconds - Math.floor(timestamp / 1000))
  if (seconds < 3) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

let counter = 0
/** Monotonic local id — crypto.randomUUID isn't available on plain http hosts. */
export function localId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

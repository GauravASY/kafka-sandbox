import type { Topic } from '../types'

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '')

export const WS_URL = (
  import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000'
).replace(/\/+$/, '')

export type PublishResponse = { status: string }

/** Build the socket URL for a user. Subscriptions are fixed by this URL. */
export function socketUrl(userId: string, topics: Topic[]): string {
  const params = new URLSearchParams({ topics: topics.join(',') })
  return `${WS_URL}/ws/${encodeURIComponent(userId)}?${params}`
}

/** POST /publish — pushes one message onto a topic. */
export async function publish(
  topic: Topic,
  message: string,
): Promise<PublishResponse> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, message }),
    })
  } catch {
    throw new Error(`Could not reach the broker at ${API_URL}`)
  }

  if (!res.ok) {
    throw new Error(`Publish failed with ${res.status} ${res.statusText}`)
  }

  try {
    return (await res.json()) as PublishResponse
  } catch {
    // A 2xx with an unreadable body still means the message went out.
    return { status: 'sent' }
  }
}

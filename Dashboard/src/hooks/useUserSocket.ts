import { useCallback, useEffect, useRef, useState } from 'react'

import { socketUrl } from '../lib/api'
import { localId } from '../lib/time'
import { TOPICS } from '../types'
import type { ConnectionStatus, Notification, Topic } from '../types'

/** Feed rows are capped so a long-running simulation can't grow unbounded. */
const MAX_FEED = 120

function isTopic(value: unknown): value is Topic {
  return TOPICS.includes(value as Topic)
}

/**
 * Pulls a notification out of a raw socket frame.
 * Returns null for anything malformed so one bad frame can't break the feed.
 */
function parseFrame(raw: unknown): Notification | null {
  if (typeof raw !== 'string') return null

  let frame: unknown
  try {
    frame = JSON.parse(raw)
  } catch {
    return null
  }

  if (typeof frame !== 'object' || frame === null) return null
  const { topic, data } = frame as { topic?: unknown; data?: unknown }
  if (!isTopic(topic)) return null

  let text: string | null = null
  if (typeof data === 'string') {
    text = data
  } else if (typeof data === 'object' && data !== null) {
    const candidate = (data as { text?: unknown }).text
    if (typeof candidate === 'string') text = candidate
  }
  if (text === null) return null

  return { id: localId('n'), topic, text, receivedAt: Date.now() }
}

export type UserSocket = {
  status: ConnectionStatus
  /** True when the socket closed on its own rather than via disconnect(). */
  dropped: boolean
  notifications: Notification[]
  unread: number
  connect: () => void
  disconnect: () => void
  clear: () => void
  markAllRead: () => void
}

/**
 * Owns one WebSocket per simulated user. Subscriptions are baked into the URL,
 * so changing topics means disconnecting and connecting again — the caller
 * enforces that by locking the inputs while the socket is live.
 */
export function useUserSocket(userId: string, topics: Topic[]): UserSocket {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [dropped, setDropped] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const socketRef = useRef<WebSocket | null>(null)

  // connect() reads these at click time, so it never needs to be re-created
  // (which would otherwise churn every keystroke in the user-id field).
  const configRef = useRef({ userId, topics })
  useEffect(() => {
    configRef.current = { userId, topics }
  }, [userId, topics])

  /** Detach handlers and close, without reporting it as a drop. */
  const teardown = useCallback(() => {
    const socket = socketRef.current
    socketRef.current = null
    if (!socket) return
    socket.onopen = null
    socket.onmessage = null
    socket.onerror = null
    socket.onclose = null
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close()
    }
  }, [])

  const disconnect = useCallback(() => {
    teardown()
    setStatus('disconnected')
    setDropped(false)
  }, [teardown])

  const connect = useCallback(() => {
    const { userId: id, topics: subscribed } = configRef.current
    if (!id.trim() || subscribed.length === 0) return

    teardown()
    setDropped(false)
    setStatus('connecting')

    let socket: WebSocket
    try {
      socket = new WebSocket(socketUrl(id.trim(), subscribed))
    } catch {
      setStatus('disconnected')
      setDropped(true)
      return
    }
    socketRef.current = socket

    socket.onopen = () => {
      if (socketRef.current !== socket) return
      setStatus('connected')
    }

    socket.onmessage = (event: MessageEvent) => {
      if (socketRef.current !== socket) return
      const notification = parseFrame(event.data)
      if (!notification) return
      setNotifications((current) =>
        [notification, ...current].slice(0, MAX_FEED),
      )
      setUnread((count) => count + 1)
    }

    socket.onclose = () => {
      // Only a socket we still consider current can have "dropped".
      if (socketRef.current !== socket) return
      socketRef.current = null
      setStatus('disconnected')
      setDropped(true)
    }

    socket.onerror = () => {
      if (socketRef.current !== socket) return
      setDropped(true)
    }
  }, [teardown])

  const clear = useCallback(() => {
    setNotifications([])
    setUnread(0)
  }, [])

  const markAllRead = useCallback(() => setUnread(0), [])

  // Close the socket when the card unmounts or is removed.
  useEffect(() => teardown, [teardown])

  return {
    status,
    dropped,
    notifications,
    unread,
    connect,
    disconnect,
    clear,
    markAllRead,
  }
}

export const TOPICS = ['alerts', 'promotional'] as const

export type Topic = (typeof TOPICS)[number]

/** Shape of the frames the server pushes down the socket. */
export type NotificationFrame = {
  topic: Topic
  data: { text: string }
}

/** A frame after it has been received, stamped and given a local id. */
export type Notification = {
  id: string
  topic: Topic
  text: string
  receivedAt: number
}

/** One row in the "Sent history" list under the send panel. */
export type SentRecord = {
  id: string
  topic: Topic
  text: string
  sentAt: number
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export type ToastKind = 'success' | 'error'

export type ToastMessage = {
  id: string
  kind: ToastKind
  title: string
  detail?: string
}

/** A simulated user card. `key` is stable for React; `id` is user-editable. */
export type SimUser = {
  key: string
  id: string
}

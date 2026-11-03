import { Radio, UserPlus, Users } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { SendPanel } from './components/SendPanel'
import { Toast } from './components/Toast'
import { UserCard } from './components/UserCard'
import { API_URL, WS_URL } from './lib/api'
import { localId } from './lib/time'
import type { SimUser, ToastKind, ToastMessage } from './types'

const INITIAL_USERS = 2

function App() {
  const nextUserNumber = useRef(INITIAL_USERS + 1)
  const [users, setUsers] = useState<SimUser[]>(() =>
    Array.from({ length: INITIAL_USERS }, (_, index) => ({
      key: localId('u'),
      id: `user-${index + 1}`,
    })),
  )
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const pushToast = useCallback(
    (kind: ToastKind, title: string, detail?: string) => {
      setToasts((current) =>
        [...current, { id: localId('t'), kind, title, detail }].slice(-3),
      )
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  function addUser() {
    const number = nextUserNumber.current
    nextUserNumber.current += 1
    setUsers((current) => [...current, { key: localId('u'), id: `user-${number}` }])
  }

  const changeUserId = useCallback((key: string, id: string) => {
    setUsers((current) =>
      current.map((user) => (user.key === key ? { ...user, id } : user)),
    )
  }, [])

  // Unmounting the card closes its socket (see useUserSocket's cleanup).
  const removeUser = useCallback((key: string) => {
    setUsers((current) => current.filter((user) => user.key !== key))
  }, [])

  return (
    <div className="mx-auto min-h-svh w-full max-w-[90rem] px-4 pb-16 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-white/6 py-6 sm:py-8">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-b from-white/8 to-transparent"
            aria-hidden="true"
          >
            <Radio className="size-4 text-neutral-300" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-50">
              Kafka Notification Lab
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Publish to a topic, watch it fan out to every subscribed socket.
            </p>
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-neutral-600">
          <div className="flex items-center gap-1.5">
            <dt className="text-neutral-700 uppercase">api</dt>
            <dd>{API_URL}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-neutral-700 uppercase">ws</dt>
            <dd>{WS_URL}</dd>
          </div>
        </dl>
      </header>

      <main className="grid grid-cols-1 items-start gap-6 pt-6 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6">
          <SendPanel onToast={pushToast} />
        </div>

        <section aria-labelledby="users-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Users className="size-4 text-neutral-600" aria-hidden="true" />
            <h2
              id="users-heading"
              className="text-sm font-semibold tracking-tight text-neutral-100"
            >
              Simulated users
            </h2>
            <span className="font-mono text-[10px] text-neutral-600 tabular-nums">
              {users.length} {users.length === 1 ? 'client' : 'clients'}
            </span>
            <button
              type="button"
              onClick={addUser}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-colors hover:border-white/20 hover:bg-ink-700"
            >
              <UserPlus className="size-3.5" aria-hidden="true" />
              Add user
            </button>
          </div>

          {users.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/8 px-4 py-12 text-center text-xs text-neutral-600">
              No simulated users. Add one to open a socket.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {users.map((user) => (
                <UserCard
                  key={user.key}
                  user={user}
                  onIdChange={changeUserId}
                  onRemove={removeUser}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App

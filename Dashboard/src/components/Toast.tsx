import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useEffect } from 'react'

import type { ToastMessage } from '../types'

const TOAST_TTL = 4000

type Props = {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

function ToastRow({
  toast,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_TTL)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isError = toast.kind === 'error'
  const Icon = isError ? XCircle : CheckCircle2

  return (
    <div
      className={`animate-toast-in pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-2.5 rounded-xl border px-3.5 py-3 shadow-2xl shadow-black/60 backdrop-blur-md ${
        isError
          ? 'border-rose-500/25 bg-rose-950/50'
          : 'border-emerald-500/25 bg-emerald-950/40'
      }`}
    >
      <Icon
        className={`mt-px size-4 shrink-0 ${isError ? 'text-rose-400' : 'text-emerald-400'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-neutral-100">
          {toast.title}
        </p>
        {toast.detail ? (
          <p className="mt-0.5 text-xs break-words text-neutral-400">
            {toast.detail}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1 rounded-md p-0.5 text-neutral-500 transition-colors hover:text-neutral-200"
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export function Toast({ toasts, onDismiss }: Props) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:px-6"
      role="region"
      aria-label="Notifications"
    >
      <div aria-live="assertive" aria-atomic="false" className="contents">
        {toasts.map((toast) => (
          <ToastRow key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}

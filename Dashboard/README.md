# Kafka Notification Lab

Frontend for a Kafka notification simulator. Publish a message to a topic, then
watch it fan out to any number of simulated users, each holding its own
WebSocket on one screen.

React + Vite + TypeScript + Tailwind CSS v4. Icons from `lucide-react`. No other
UI library.

## Setup

```bash
cd Dashboard
npm install
cp .env.example .env   # already present; edit if your backend isn't on :8000
npm run dev
```

Open the URL Vite prints (http://localhost:5173, or the next free port).

### Environment

| Variable        | Default                 | Used for               |
| --------------- | ----------------------- | ---------------------- |
| `VITE_API_URL`  | `http://localhost:8000` | `POST /publish`        |
| `VITE_WS_URL`   | `ws://localhost:8000`   | `GET /ws/{user_id}`    |

Both are read at build time and shown in the page header, so you can see at a
glance which broker the UI is pointed at.

### Scripts

| Command           | Does                                   |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Dev server with HMR                    |
| `npm run build`   | Typecheck (`tsc -b`) then bundle       |
| `npm run lint`    | ESLint                                 |
| `npm run preview` | Serve the production build             |

## Backend contract

The UI expects exactly this and nothing more:

- `POST {VITE_API_URL}/publish` with `{"topic": "alerts" | "promotional", "message": "<text>"}`
  responding `{"status": "sent"}`. Any 2xx counts as sent; a non-2xx or a network
  failure raises an error toast.
- `WebSocket {VITE_WS_URL}/ws/{user_id}?topics=alerts,promotional` pushing frames
  shaped `{"topic": "alerts", "data": {"text": "..."}}`.

Two things worth knowing about the socket:

1. **Subscriptions are fixed by the URL.** Changing a card's topics therefore
   means closing the socket and opening a new one, so the topic checkboxes and
   the user-ID field are locked while a card is connected. The card shows a hint
   saying to disconnect first.
2. **The `topics` value is percent-encoded**, so the comma arrives as `%2C`:
   `/ws/user-1?topics=alerts%2Cpromotional`. Any normal query-string parser
   (FastAPI's included) decodes that for you, but a backend that splits the raw
   query string by hand needs to unquote it first.

Malformed frames — invalid JSON, an unknown topic, a missing `data.text` — are
dropped silently rather than crashing or landing in the feed.

## How to test fan-out

With the backend running and `npm run dev` up:

1. The page starts with **user-1** and **user-2**. Press **Add user** once to get
   **user-3**.
2. Set subscriptions before connecting:
   - **user-1** — both `alerts` and `promotional`
   - **user-2** — `alerts` only
   - **user-3** — `promotional` only
3. Hit **Connect** on all three. Each status dot goes grey → yellow → green.
4. In **Send notification**, pick `alerts`, type `Server CPU at 94%`, send
   (or press ⌘/Ctrl+Enter).
   → lands in **user-1** and **user-2**. **user-3** stays empty.
5. Switch to `promotional`, send `20% off today`.
   → lands in **user-1** and **user-3**. **user-2** is unchanged.

Each delivery slides into the top of that card's feed with an amber or violet
badge, a relative timestamp, and a bump to the unread counter. Click the
`n new` pill to mark read, **Clear** to empty a feed.

Then try the edges:

- **Disconnect** one card and send again — it receives nothing while the others
  still do, and its topic checkboxes unlock.
- **Stop the backend** while connected. The card drops to a grey
  `Disconnected` dot plus a "Socket dropped" notice. Reconnecting is manual by
  design; there is no auto-reconnect.
- **Remove** a card, or reload the page, and its socket is closed on the way out.
- Point two cards at the **same user ID** to confirm the broker fans out per
  connection, not per user.

## Structure

```
src/
  App.tsx                      layout, user list, toast queue
  types.ts                     shared types (Topic, Notification, SimUser, …)
  hooks/useUserSocket.ts       one WebSocket per card: connect/disconnect,
                               drop detection, frame parsing, cleanup
  lib/api.ts                   publish() + socketUrl(), env plumbing
  lib/topics.ts                per-topic colors in one place
  lib/time.ts                  shared 1s clock, relative timestamps, local ids
  components/
    SendPanel.tsx              topic segments, textarea, send, sent history
    UserCard.tsx               one simulated client end to end
    NotificationItem.tsx       a single feed row
    TopicBadge.tsx             the amber/violet topic pill
    Toast.tsx                  success/failure toasts
```

Each `UserCard` calls `useUserSocket` itself, so every card owns an independent
connection and nothing is shared between them but the page's clock.

## Notes

- Dark only, near-black with hairline borders; `Inter` for text and
  `JetBrains Mono` for IDs, counts and timestamps.
- Feeds are capped at the 120 most recent frames per card, and sent history at
  the last 10, so a long-running simulation doesn't grow without bound.
- Accessibility: labelled controls, visible focus rings, `aria-pressed` on the
  topic segments, `aria-live="polite"` feeds, `aria-live="assertive"` toasts, and
  motion is suppressed under `prefers-reduced-motion`.

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").trim();
const SSE_URL = API_URL.replace(/\/+$/, "").replace(/\/api$/, "") + "/api/events";

export type SSEEvent = { type: string; data?: Record<string, unknown> };

const dataListeners: Set<(evt: SSEEvent) => void> = new Set();
const reloadListeners: Set<() => void> = new Set();
let es: EventSource | null = null;

function notify(evt: SSEEvent) {
  dataListeners.forEach((cb) => cb(evt));
  reloadListeners.forEach((cb) => cb());
}

function connect() {
  if (typeof window === "undefined") return;
  if (es) { es.close(); es = null; }
  es = new EventSource(SSE_URL);
  es.onerror = () => {
    if (es?.readyState === EventSource.CLOSED) { es = null; setTimeout(connect, 3000); }
  };
  const handle = (type: string) => (e: MessageEvent) => {
    let data;
    try { data = JSON.parse(e.data); } catch { data = {}; }
    notify({ type, data });
  };
  es.addEventListener("new_booking", handle("new_booking"));
  es.addEventListener("booking_updated", handle("booking_updated"));
  es.addEventListener("booking_deleted", handle("booking_deleted"));
  es.addEventListener("new_review", handle("new_review"));
}

let connected = false;
function ensureConnected() { if (!connected) { connected = true; connect(); } }

export function onSSE(callback: () => void): () => void {
  ensureConnected();
  reloadListeners.add(callback);
  return () => { reloadListeners.delete(callback); };
}

export function onSSEEvent(callback: (evt: SSEEvent) => void): () => void {
  ensureConnected();
  dataListeners.add(callback);
  return () => { dataListeners.delete(callback); };
}

/**
 * A tiny scheduler that keeps outbound requests inside Jikan's public rate
 * limits (roughly 3 requests/second and 60 requests/minute).
 *
 * The Home screen fans out several calls at once; without this they burst in
 * parallel and earn a 429 storm. Everything funnels through `schedule()`, which
 * serialises tasks behind both a minimum gap and a rolling per-minute window.
 */

const MIN_INTERVAL_MS = 400; // ~2.5 req/s, comfortably under the ~3/s ceiling
const MAX_PER_MINUTE = 55; // a little headroom under the documented 60/min
const WINDOW_MS = 60_000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

type QueuedTask = () => void;

const queue: QueuedTask[] = [];
/** Timestamps of requests started inside the current rolling window. */
let recentStarts: number[] = [];
let lastStart = 0;
let draining = false;

/** How long we must wait before it is legal to start another request. */
function delayUntilNextSlot(): number {
  const now = Date.now();

  const sinceLast = now - lastStart;
  let wait = sinceLast >= MIN_INTERVAL_MS ? 0 : MIN_INTERVAL_MS - sinceLast;

  recentStarts = recentStarts.filter((t) => now - t < WINDOW_MS);
  if (recentStarts.length >= MAX_PER_MINUTE) {
    // Wait for the oldest entry to age out of the window.
    const oldest = recentStarts[0];
    wait = Math.max(wait, WINDOW_MS - (now - oldest));
  }

  return wait;
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;

  while (queue.length > 0) {
    const wait = delayUntilNextSlot();
    if (wait > 0) await sleep(wait);

    const task = queue.shift();
    if (!task) break;

    lastStart = Date.now();
    recentStarts.push(lastStart);
    task();
  }

  draining = false;
}

/**
 * Run `task` as soon as the rate limiter allows. Resolves/rejects with whatever
 * the task does; queue order is preserved (FIFO).
 */
export function schedule<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push(() => {
      task().then(resolve, reject);
    });
    void drain();
  });
}

/** Exposed for tests so queue state does not leak between cases. */
export function resetQueue(): void {
  queue.length = 0;
  recentStarts = [];
  lastStart = 0;
  draining = false;
}

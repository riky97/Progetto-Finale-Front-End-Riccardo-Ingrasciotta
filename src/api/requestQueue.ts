/**
 * A tiny scheduler that keeps outbound requests inside AniList's rate limit.
 *
 * AniList documents 90 requests/minute, but the live API has been serving a
 * degraded limit for a long while: responses currently come back with
 * `X-RateLimit-Limit: 30`, i.e. 30 requests per rolling minute. We pace against
 * the *observed* header value, not the documented one, with a little headroom.
 *
 * Unlike the previous Jikan pacing there is no meaningful per-second ceiling —
 * AniList only enforces the per-minute budget — so the minimum gap here is
 * small and exists purely to avoid slamming several requests into the same
 * millisecond. That matters for UX: the Home screen fans out four queries at
 * once and they should not be serialised into a multi-second staircase.
 *
 * Everything funnels through `schedule()`, which holds tasks behind both the
 * minimum gap and a rolling per-minute window.
 */

const MIN_INTERVAL_MS = 120; // just enough to avoid a simultaneous burst
const MAX_PER_MINUTE = 28; // headroom under the observed X-RateLimit-Limit: 30
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

import { Button } from "antd";
import type { ApiError } from "@/api/client";

/** Shimmering placeholders sized like the card grid they replace. */
export function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="Loading anime">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton-card" key={i} />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  error: ApiError;
  onRetry?: () => void;
}

/**
 * Error copy explains what happened and what to do next — no apology, no
 * mood, and never a bare "Something went wrong".
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="state" role="alert">
      <div className="state__mark">
        {error.status === 429 ? "SLOW DOWN" : "OFF AIR"}
      </div>
      <h3 className="state__title">Couldn&rsquo;t load this</h3>
      <p className="state__body">{error.message}</p>
      {onRetry ? (
        <Button onClick={onRetry} type="primary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  body: string;
}

/** An empty screen is an invitation to act, so it always names the next move. */
export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="state">
      <div className="state__mark">NO SIGNAL</div>
      <h3 className="state__title">{title}</h3>
      <p className="state__body">{body}</p>
    </div>
  );
}

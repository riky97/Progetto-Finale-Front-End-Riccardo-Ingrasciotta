import type { ReactNode } from "react";
import type { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CARD_GRID_CLASS } from "@/shared/gridConfig";

/**
 * Placeholders shaped like the cards they stand in for: empty apertures
 * waiting for art, with the ruled metadata strip already drawn.
 */
export function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <div
      className={CARD_GRID_CLASS}
      aria-busy="true"
      aria-label="Loading anime"
      role="status"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="aperture aspect-[2/3] w-full bg-paper-2 [&::after]:border-blue-pale [&::before]:border-blue-pale">
            <Skeleton className="h-full w-full bg-paper-3" />
          </div>
          <div className="mt-2.5 border-t-2 border-blue-pale pt-2">
            <Skeleton className="h-3 w-4/5 bg-paper-3" />
            <Skeleton className="mt-2 h-2 w-1/2 bg-paper-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The shared frame for anything that isn't a result: a stamped-off sheet. */
function StatePanel({
  mark,
  title,
  children,
  role,
}: {
  mark: string;
  title: string;
  children: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      className="ruled border-2 border-ink bg-paper-2/60 px-6 py-12 text-center"
    >
      <span className="annotation inline-block border-2 border-blue-ink px-2.5 py-1">
        {mark}
      </span>
      <h3 className="mt-5 font-heading text-lg tracking-[0.04em] uppercase">
        {title}
      </h3>
      {children}
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
    <StatePanel
      role="alert"
      mark={error.status === 429 ? "Rate limited" : "Off sheet"}
      title="Couldn't load this"
    >
      <p className="mx-auto mt-2 max-w-md text-sm text-graphite">
        {error.message}
      </p>
      {onRetry ? (
        <Button onClick={onRetry} size="lg" className="mt-6 px-4">
          Try again
        </Button>
      ) : null}
    </StatePanel>
  );
}

interface EmptyStateProps {
  title: string;
  body: string;
  mark?: string;
}

/** An empty screen is an invitation to act, so it always names the next move. */
export function EmptyState({ title, body, mark = "Blank cel" }: EmptyStateProps) {
  return (
    <StatePanel mark={mark} title={title}>
      <p className="mx-auto mt-2 max-w-md text-sm text-graphite">{body}</p>
    </StatePanel>
  );
}

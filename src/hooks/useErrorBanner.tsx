import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import ErrorBanner from "@/components/ErrorBanner";

const GENERIC_MESSAGE = "Couldn't save that. Try again.";
const AUTO_DISMISS_MS = 6000;

interface ErrorBannerContextValue {
  /** Pass a message for a specific action; omit it for the generic copy. */
  showError: (message?: string) => void;
}

const ErrorBannerContext = createContext<ErrorBannerContextValue | null>(null);

/**
 * A single banner for the whole app, not a per-feature error state.
 *
 * It exists for failures that happen mid-session away from any loading/error
 * screen — a favourite/watched toggle failing while browsing the home page,
 * for instance. The card already rolls its optimistic update back on its own;
 * this is only the "something didn't save" notice, deliberately generic
 * rather than surfacing raw network/CORS text to someone who can't act on it.
 */
export function ErrorBannerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const dismissTimer = useRef<number>();

  const dismiss = useCallback(() => {
    window.clearTimeout(dismissTimer.current);
    setMessage(null);
  }, []);

  const showError = useCallback((msg?: string) => {
    setMessage(msg ?? GENERIC_MESSAGE);
    window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(dismiss, AUTO_DISMISS_MS);
  }, [dismiss]);

  return (
    <ErrorBannerContext.Provider value={{ showError }}>
      {children}
      {message ? <ErrorBanner message={message} onDismiss={dismiss} /> : null}
    </ErrorBannerContext.Provider>
  );
}

export function useErrorBanner(): ErrorBannerContextValue {
  const value = useContext(ErrorBannerContext);
  if (!value) {
    throw new Error(
      "useErrorBanner must be used inside <ErrorBannerProvider>.",
    );
  }
  return value;
}

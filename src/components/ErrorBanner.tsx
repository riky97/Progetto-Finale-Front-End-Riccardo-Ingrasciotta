interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

/** Fixed to the viewport so it's visible regardless of which page/scroll position triggered it. */
export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner__text">{message}</span>
      <button
        type="button"
        className="error-banner__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

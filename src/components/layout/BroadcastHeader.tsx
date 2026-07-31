import { useSection } from "@/shared/useSection";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "short",
});

/**
 * The channel bug. This replaces the old centred 4em "ANIME LIST" heading,
 * which simply repeated the sidebar logo; the page's real heading is now the
 * section title, which is both better structure and better for screen readers.
 */
export default function BroadcastHeader() {
  const section = useSection();

  return (
    <header className="broadcast">
      <span className="broadcast__mark" aria-hidden="true" />
      <h1 className="broadcast__section">{section.label}</h1>
      <span className="broadcast__meta">
        {DATE_FORMAT.format(new Date()).toUpperCase()}
      </span>
      <p className="broadcast__desc">{section.description}</p>
    </header>
  );
}

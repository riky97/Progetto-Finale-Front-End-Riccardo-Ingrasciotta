import { useSection } from "@/shared/useSection";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/**
 * The head of the sheet. A timing sheet names what it is before anything is
 * drawn on it, so this strip does the same: the field label, the section as
 * the page's real `h1`, the date it was pulled, and the double rule that
 * closes the header block.
 *
 * This replaced a centred 4em "ANIME LIST" heading that only repeated the
 * masthead; the page's heading is now the section, which is both better
 * structure and better for screen readers.
 */
export default function SheetHeader() {
  const section = useSection();

  return (
    <header className="pt-8 pb-6 md:pt-12">
      <div className="flex items-baseline justify-between gap-4">
        <span className="annotation">Section</span>
        <span className="annotation shrink-0">
          {DATE_FORMAT.format(new Date())}
        </span>
      </div>

      <h1 className="mt-2 font-display text-[clamp(1.6rem,1rem+2.6vw,3rem)] leading-[0.95] tracking-[0.01em] uppercase">
        {section.label}
      </h1>

      <p className="mt-3 max-w-prose text-sm text-graphite">
        {section.description}
      </p>

      <div className="mt-5 border-t-2 border-ink" />
      <div className="mt-[3px] border-t border-blue-pale" />
    </header>
  );
}

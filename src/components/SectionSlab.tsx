import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SectionSlabProps {
  title: string;
  /** Optional count shown after the rule, e.g. "25 titles". */
  count?: ReactNode;
  /** Optional "view all" destination. */
  moreTo?: string;
  moreLabel?: string;
}

/**
 * A row header on the sheet: pink tab, title, then a blue rule running out to
 * the count and the "view all" link. The rule is the device that ties the
 * label to the numbers on its right, exactly as a ruled row does on paper.
 */
export default function SectionSlab({
  title,
  count,
  moreTo,
  moreLabel = "View all",
}: SectionSlabProps) {
  return (
    <div className="mt-12 mb-5 flex items-center gap-3 first:mt-0">
      <span aria-hidden="true" className="h-6 w-[5px] shrink-0 bg-pink" />

      <h2 className="shrink-0 font-heading text-base tracking-[0.06em] uppercase sm:text-lg">
        {title}
      </h2>

      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-blue-pale" />

      {count ? <span className="annotation shrink-0">{count}</span> : null}

      {moreTo ? (
        <Link
          to={moreTo}
          className="annotation group inline-flex shrink-0 items-center gap-1.5 text-blue-ink hover:text-pink-deep"
        >
          {moreLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-3 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}

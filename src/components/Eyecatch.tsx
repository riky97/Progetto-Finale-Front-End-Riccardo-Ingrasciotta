import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface EyecatchProps {
  title: string;
  /** Optional count/eyebrow shown after the rule, e.g. "25 titles". */
  count?: ReactNode;
  /** Optional "view all" destination. */
  moreTo?: string;
  moreLabel?: string;
}

/**
 * The signature device: a sheared vermilion slab carrying a section title,
 * echoing the eyecatch card that slams on screen at an anime's ad break.
 */
export default function Eyecatch({
  title,
  count,
  moreTo,
  moreLabel = "View all",
}: EyecatchProps) {
  return (
    <div className="eyecatch">
      <h2 className="eyecatch__slab">
        <span className="eyecatch__title">{title}</span>
      </h2>
      <span className="eyecatch__rule" />
      {count ? <span className="eyecatch__count">{count}</span> : null}
      {moreTo ? (
        <Link className="eyecatch__link" to={moreTo}>
          {moreLabel} →
        </Link>
      ) : null}
    </div>
  );
}

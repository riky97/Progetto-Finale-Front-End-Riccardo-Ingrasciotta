import { Tooltip } from "antd";
import type { MouseEvent } from "react";
import type { CollectionState } from "@/hooks/useLibrary";

export type ToggleVariant = "card" | "detail";

interface LibraryToggleProps {
  state: CollectionState;
  animeId: number;
  /** Title of the anime, for the accessible label. */
  animeTitle: string;
  /** The mark shown when saved / not saved. Kept to one or two glyphs. */
  glyph: string;
  /** Verb used in the label and tooltip, e.g. "Favourite". */
  label: string;
  savedLabel: string;
  /** `card` is the small overlay button; `detail` is the wide labelled slab. */
  variant?: ToggleVariant;
}

/**
 * The favourite / watched control.
 *
 * Deliberately not an antd `Button`: on a card it sits *inside* a `<Link>`, so
 * it has to stop the click from navigating, and it borrows the sheared-slab
 * device (see `.anime-rail__arrow`) rather than introducing a rounded pill.
 *
 * Callers gate this behind `<SignedIn>` — it never renders a "sign in first"
 * state of its own, because a card is not the place to run an auth prompt.
 */
export default function LibraryToggle({
  state,
  animeId,
  animeTitle,
  glyph,
  label,
  savedLabel,
  variant = "card",
}: LibraryToggleProps) {
  const saved = state.has(animeId);
  const pending = state.isPending(animeId);
  const text = saved ? savedLabel : label;

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // On a card this button is nested in the poster link.
    event.preventDefault();
    event.stopPropagation();
    void state.toggle(animeId);
  };

  const button = (
    <button
      type="button"
      className={`lib-toggle lib-toggle--${variant}${
        saved ? " lib-toggle--on" : ""
      }`}
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={`${text}: ${animeTitle}`}
    >
      <span className="lib-toggle__glyph" aria-hidden="true">
        {glyph}
      </span>
      {variant === "detail" ? (
        <span className="lib-toggle__text">{text}</span>
      ) : null}
    </button>
  );

  // The card variant is icon-only, so it needs the tooltip to be legible.
  return variant === "card" ? (
    <Tooltip title={text} placement="left" mouseEnterDelay={0.3}>
      {button}
    </Tooltip>
  ) : (
    button
  );
}

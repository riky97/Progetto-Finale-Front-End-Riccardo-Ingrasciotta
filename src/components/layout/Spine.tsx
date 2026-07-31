import { Home, Search, Tags } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { sectionKeyForPath } from "@/shared/useSection";

const NAV = [
  { key: "home", to: "/", label: "Home", Icon: Home },
  { key: "genre", to: "/genre", label: "Genre", Icon: Tags },
  { key: "search", to: "/search", label: "Search", Icon: Search },
] as const;

interface SpineProps {
  isMobile: boolean;
}

/**
 * The bound edge of the sheet: an ink spine carrying the masthead and the
 * three sections, punched with peg holes where it meets the paper.
 *
 * The active item comes from the router, not `localStorage.getItem("path")`,
 * so it stays correct through back/forward navigation.
 *
 * Deliberately unnumbered — the sections are a set, not a sequence, and
 * numerals in this design mean "the data is ordered".
 */
export default function Spine({ isMobile }: SpineProps) {
  const { pathname } = useLocation();
  const active = sectionKeyForPath(pathname);

  if (isMobile) {
    return (
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--rail-h)] border-t-2 border-ink bg-ink"
      >
        {NAV.map(({ key, to, label, Icon }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              to={to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-on-ink relative flex flex-1 flex-col items-center justify-center gap-1 font-mono text-[0.6rem] tracking-[0.18em] uppercase transition-colors",
                isActive ? "text-paper" : "text-paper/55",
              )}
            >
              {isActive ? (
                <span className="absolute inset-x-4 top-0 h-[3px] bg-pink" />
              ) : null}
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[var(--spine-w)] flex-col bg-ink text-paper">
      <Link
        to="/"
        className="focus-on-ink block px-6 pt-8 pb-9 leading-[0.82]"
        aria-label="Anime List, home"
      >
        <span className="block font-display text-[1.35rem] tracking-[0.02em]">
          ANIME
        </span>
        <span className="block font-display text-[1.35rem] tracking-[0.02em] text-pink">
          LIST
        </span>
      </Link>

      <nav aria-label="Sections" className="flex flex-col">
        {NAV.map(({ key, to, label, Icon }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              to={to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "focus-on-ink relative flex items-center gap-3 py-3.5 pr-6 pl-6 font-mono text-xs tracking-[0.2em] uppercase transition-colors",
                isActive
                  ? "bg-ink-2 text-paper"
                  : "text-paper/55 hover:bg-ink-2 hover:text-paper",
              )}
            >
              {isActive ? (
                <span className="absolute inset-y-0 left-0 w-[4px] bg-pink" />
              ) : null}
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-auto px-6 pb-8 font-mono text-[0.62rem] leading-relaxed tracking-[0.16em] text-paper/40 uppercase">
        Source
        <br />
        Jikan / MyAnimeList
      </p>

      {/* The peg holes, where the spine meets the sheet. */}
      <span
        aria-hidden="true"
        className="punch-strip absolute inset-y-0 right-0 w-7"
      />
    </aside>
  );
}

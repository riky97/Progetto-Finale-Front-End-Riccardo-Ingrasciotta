import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { searchAnime } from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import SectionSlab from "@/components/SectionSlab";
import SheetPagination from "@/components/SheetPagination";
import { EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";

/**
 * The query lives in the URL (`/search?q=naruto&page=2`), which makes a result
 * set shareable and makes back/forward work. The previous implementation
 * mirrored both the query and the entire result array into `localStorage` and
 * replayed it on mount.
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const results = useAnimeQuery(() => searchAnime(query, { page }), [query, page], {
    enabled: query.length > 0,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    const next = String(value ?? "").trim();
    // A new query always starts at page 1.
    setSearchParams(next ? { q: next } : {});
  };

  const goToPage = (next: number) => {
    setSearchParams(next === 1 ? { q: query } : { q: query, page: String(next) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const total = results.data?.pagination.items.total;
  const pageCount = results.data?.pagination.last_visible_page ?? 1;

  return (
    <>
      <SectionSlab
        title={query ? `Results for “${query}”` : "Search"}
        count={
          query && total !== undefined
            ? `${total.toLocaleString()} matches`
            : undefined
        }
      />

      <form
        onSubmit={onSubmit}
        role="search"
        className="mb-9 flex max-w-2xl items-stretch gap-0 border-2 border-ink bg-paper"
      >
        <label htmlFor="q" className="sr-only">
          Search anime by title
        </label>
        <Input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search any anime title"
          autoComplete="off"
          /* `outline-solid` is load-bearing here: the Input primitive sets
             `outline-style: none`, so a width alone draws nothing. */
          className="h-12 rounded-none border-0 bg-transparent px-4 text-base focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-[var(--color-blue)]"
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 shrink-0 gap-2 rounded-none px-5 font-mono text-xs tracking-[0.16em] uppercase focus-visible:ring-blue"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
        </Button>
      </form>

      {query ? (
        <>
          <AnimeGrid
            items={results.data?.data}
            loading={results.loading}
            error={results.error}
            onRetry={results.refetch}
            rows={4}
            emptyTitle="No matches"
            emptyBody={`Nothing came back for “${query}”. Try a shorter title, or the original romaji spelling.`}
          />

          {!results.loading && !results.error ? (
            <SheetPagination
              page={page}
              pageCount={pageCount}
              onChange={goToPage}
              hrefFor={(target) =>
                target === 1
                  ? `?q=${encodeURIComponent(query)}`
                  : `?q=${encodeURIComponent(query)}&page=${target}`
              }
            />
          ) : null}
        </>
      ) : (
        <EmptyState
          mark="Standby"
          title="Search the catalogue"
          body="Type a title above — try “Cowboy Bebop”, “Frieren”, or just “gundam”."
        />
      )}
    </>
  );
}

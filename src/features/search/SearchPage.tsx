import { Input } from "antd";
import { useSearchParams } from "react-router-dom";
import { searchAnime } from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import Eyecatch from "@/components/Eyecatch";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";

const { Search } = Input;

/**
 * The query lives in the URL (`/search?q=naruto`), which makes a result set
 * shareable and makes back/forward work. The previous implementation mirrored
 * both the query and the entire result array into `localStorage` and replayed
 * it on mount.
 */
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const results = useAnimeQuery(() => searchAnime(query), [query], {
    enabled: query.length > 0,
  });

  const onSearch = (value: string) => {
    const next = value.trim();
    setSearchParams(next ? { q: next } : {});
  };

  const total = results.data?.pagination.items.total;

  return (
    <>
      <Eyecatch
        title={query ? `Results for “${query}”` : "Search"}
        count={
          query && total !== undefined
            ? `${total.toLocaleString()} matches`
            : undefined
        }
      />

      <div className="search-bar">
        <Search
          allowClear
          defaultValue={query}
          placeholder="Search any anime title"
          enterButton="Search"
          size="large"
          onSearch={onSearch}
          aria-label="Search anime by title"
        />
      </div>

      {query ? (
        <AnimeGrid
          items={results.data?.data}
          loading={results.loading}
          error={results.error}
          onRetry={results.refetch}
          rows={4}
          emptyTitle="No matches"
          emptyBody={`Nothing came back for “${query}”. Try a shorter title or the original romaji spelling.`}
        />
      ) : (
        <div className="state">
          <div className="state__mark">STANDBY</div>
          <h3 className="state__title">Search the catalogue</h3>
          <p className="state__body">
            Type a title above — try “Cowboy Bebop”, “Frieren”, or just “gundam”.
          </p>
        </div>
      )}
    </>
  );
}

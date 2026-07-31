/** The foot of the sheet: who drew it, and where the numbers came from. */
export default function SheetFooter() {
  return (
    <footer className="mt-16 border-t border-blue-pale pt-5 pb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="annotation">Anime List</span>
        <span className="text-xs text-graphite">
          Data by{" "}
          <a
            href="https://jikan.moe/"
            className="text-blue-ink underline underline-offset-2 hover:text-pink-deep"
            target="_blank"
            rel="noreferrer noopener"
          >
            Jikan
          </a>{" "}
          / MyAnimeList · Built by Riccardo Ingrasciotta
        </span>
      </div>
    </footer>
  );
}

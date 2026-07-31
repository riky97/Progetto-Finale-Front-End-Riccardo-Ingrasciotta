import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface SheetPaginationProps {
  page: number;
  pageCount: number;
  /** Called with the target page; the caller writes it to the URL. */
  onChange: (page: number) => void;
  /** Builds the real `href` so middle-click and "open in new tab" still work. */
  hrefFor: (page: number) => string;
}

/**
 * Page numbers around the current page, with the first and last always
 * reachable. `-1` marks a gap.
 */
function pageWindow(page: number, pageCount: number): number[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, pageCount, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < pageCount) pages.add(page + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const out: number[] = [];
  sorted.forEach((value, i) => {
    if (i > 0 && value - sorted[i - 1] > 1) out.push(-1);
    out.push(value);
  });
  return out;
}

/**
 * Paging for the browse surfaces. Every control is a real link to a real URL
 * (`?page=3`), intercepted for client-side navigation — so a page of results
 * stays shareable and back/forward keeps working.
 */
export default function SheetPagination({
  page,
  pageCount,
  onChange,
  hrefFor,
}: SheetPaginationProps) {
  if (pageCount <= 1) return null;

  const go = (target: number) => (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    onChange(Math.min(Math.max(target, 1), pageCount));
  };

  return (
    <div className="mt-10 border-t-2 border-ink pt-5">
      <Pagination className="font-mono">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              href={hrefFor(page - 1)}
              onClick={go(page - 1)}
              aria-disabled={page === 1}
              className={
                page === 1 ? "pointer-events-none opacity-40" : undefined
              }
            />
          </PaginationItem>

          {pageWindow(page, pageCount).map((value, i) =>
            value === -1 ? (
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis className="text-blue-ink" />
              </PaginationItem>
            ) : (
              <PaginationItem key={value}>
                <PaginationLink
                  href={hrefFor(value)}
                  onClick={go(value)}
                  isActive={value === page}
                  className="tabular-nums data-[active=true]:border-ink data-[active=true]:bg-pink data-[active=true]:text-ink"
                >
                  {value}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={hrefFor(page + 1)}
              onClick={go(page + 1)}
              aria-disabled={page === pageCount}
              className={
                page === pageCount
                  ? "pointer-events-none opacity-40"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

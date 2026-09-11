import type { ReactNode } from "react";
import type { GenreFilters } from "@/api/anime";
import type {
  GenreSort,
  MediaFormatFilter,
  MediaStatusFilter,
} from "@/types/anilist";
import {
  DEFAULT_SORT,
  FORMAT_OPTIONS,
  SCORE_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  YEAR_OPTIONS,
  hasActiveFilters,
} from "./genreFilters";

interface FilterBarProps {
  filters: GenreFilters;
  /** Called with the whole next filter set; the page writes it to the URL. */
  onChange: (next: GenreFilters) => void;
  onClear: () => void;
  /** Disables the controls while a page is in flight. */
  busy?: boolean;
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <label className="filter-field">
      <span className="filter-field__label">{label}</span>
      {children}
    </label>
  );
}

/**
 * The genre page's narrowing controls.
 *
 * Native `<select>`s on purpose: antd v4's Select is unused anywhere else in
 * this app, portals its dropdown outside the themed tree, and would need its
 * own override file — which `antd-overrides.css` exists to prevent. Native
 * selects also give mobile the OS picker for free. They are dressed as hard
 * ink slabs with a vermilion underline so they read as the same design system
 * as the eyecatch device rather than a generic form panel.
 */
export default function FilterBar({
  filters,
  onChange,
  onClear,
  busy = false,
}: FilterBarProps) {
  const active = hasActiveFilters(filters);

  return (
    <div className="filter-bar">
      <span className="filter-bar__tag">Filter</span>

      <div className="filter-bar__fields">
        <Field label="Sort">
          <select
            className="filter-field__control"
            disabled={busy}
            value={filters.sort ?? DEFAULT_SORT}
            onChange={(event) =>
              onChange({ ...filters, sort: event.target.value as GenreSort })
            }
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Format">
          <select
            className="filter-field__control"
            disabled={busy}
            value={filters.format ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                format: (event.target.value || undefined) as
                  | MediaFormatFilter
                  | undefined,
              })
            }
          >
            <option value="">Any</option>
            {FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Min score">
          <select
            className="filter-field__control"
            disabled={busy}
            value={filters.minScore ? String(filters.minScore) : ""}
            onChange={(event) =>
              onChange({
                ...filters,
                minScore: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
          >
            <option value="">Any</option>
            {SCORE_OPTIONS.map((score) => (
              <option key={score} value={score}>
                {score.toFixed(1)}+
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            className="filter-field__control"
            disabled={busy}
            value={filters.status ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value || undefined) as
                  | MediaStatusFilter
                  | undefined,
              })
            }
          >
            <option value="">Any</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year">
          <select
            className="filter-field__control"
            disabled={busy}
            value={filters.year ? String(filters.year) : ""}
            onChange={(event) =>
              onChange({
                ...filters,
                year: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          >
            <option value="">Any</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {active ? (
        <button type="button" className="filter-bar__clear" onClick={onClear}>
          <span className="filter-bar__clear-text">Clear filters</span>
        </button>
      ) : null}
    </div>
  );
}

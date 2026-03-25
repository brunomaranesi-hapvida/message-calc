"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  sortValue?: (item: T) => string | number;
  render: (item: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  pageSize?: number;
  emptyMessage?: string;
}

type SortOrder = "asc" | "desc";

const ALIGN: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 10,
  emptyMessage = "Nenhum item encontrado.",
}: Props<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [data]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setPage(1);
  }

  const sorted = useMemo(() => {
    if (!sortBy) return data;
    const col = columns.find((c) => c.key === sortBy);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const aVal = col.sortValue
        ? col.sortValue(a)
        : (a as Record<string, unknown>)[sortBy];
      const bVal = col.sortValue
        ? col.sortValue(b)
        : (b as Record<string, unknown>)[sortBy];

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""), "pt-BR", {
          sensitivity: "base",
        });
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [data, sortBy, sortOrder, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center border border-slate-200 shadow-sm">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div>
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 font-medium text-slate-500 ${ALIGN[col.align ?? "left"]} ${col.headerClassName ?? ""} ${col.sortable ? "cursor-pointer select-none hover:text-slate-700 transition-colors" : ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className={`inline-flex items-center gap-1 ${col.align === "right" ? "justify-end w-full" : col.align === "center" ? "justify-center w-full" : ""}`}>
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sortOrder === "asc" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        )}
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-4 ${ALIGN[col.align ?? "left"]}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-slate-500">
            {sorted.length} {sorted.length === 1 ? "item" : "itens"} &bull; Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Anterior
            </button>
            {getPageNumbers().map((n, i) =>
              n === "ellipsis" ? (
                <span key={`e${i}`} className="px-2 text-slate-400">…</span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    page === n
                      ? "bg-primary text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

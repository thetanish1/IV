import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemName = "records",
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1 && totalItems === undefined) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-ink-800 bg-ink-900/30">
      <span className="text-xs text-ink-400">
        Showing page <strong className="text-ink-200">{currentPage}</strong> of{" "}
        <strong className="text-ink-200">{Math.max(1, totalPages)}</strong>
        {totalItems !== undefined && (
          <span className="text-ink-500 ml-1.5">({totalItems} total {itemName})</span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-40 transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={disabled || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg bg-ink-900 border border-ink-800 text-ink-300 hover:text-white disabled:opacity-40 transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

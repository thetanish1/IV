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
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-[#27272A] bg-gray-50/50 dark:bg-[#151518]/50">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Showing page <strong className="text-gray-900 dark:text-white">{currentPage}</strong> of{" "}
        <strong className="text-gray-900 dark:text-white">{Math.max(1, totalPages)}</strong>
        {totalItems !== undefined && (
          <span className="text-gray-400 dark:text-gray-500 ml-1.5">({totalItems} total {itemName})</span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled || currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A30] disabled:opacity-40 transition-colors shadow-sm"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={disabled || currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg bg-white dark:bg-[#1F1F23] border border-gray-300 dark:border-[#2E2E33] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A30] disabled:opacity-40 transition-colors shadow-sm"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

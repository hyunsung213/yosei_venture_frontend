'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationInfo } from '@/interface/interface';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, hasPrev, hasNext } = pagination;

  if (totalPages <= 1) return null;

  const pages = [];
  // 보여줄 페이지 번호의 범위를 계산 (현재 페이지 기준 앞뒤 2개씩)
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, page + 2);

  if (page <= 3) {
    endPage = Math.min(5, totalPages);
  } else if (page >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
              p === page
                ? 'bg-yonsei-blue text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

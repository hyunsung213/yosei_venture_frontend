'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Loader2, ServerOff, Calendar, PlusCircle, X } from 'lucide-react';
import { getAllPrograms } from '@/api/get';
import { getImage } from '@/utils/imageUtils';
import { useAuth } from "@/contexts/AuthContext";
import { ProgramSimple, PaginationInfo } from '@/interface/interface';
import Pagination from '@/components/common/Pagination';

import { Suspense } from 'react';

function ProgramListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [programs, setPrograms] = useState<ProgramSimple[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { role } = useAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);


  function calculateDDay(date: string) {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
    

  useEffect(() => {
    async function fetchPrograms() {
      setLoading(true);
      try {
        const data = await getAllPrograms(page, 10);
        if (data) {
          setPrograms(data.items || []);
          setPagination(data.pagination);
        } else {
          setPrograms([]);
        }
      } catch (e) {
        console.error("Program 목록 로드 실패:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(`/program/list?page=${newPage}`);
  };

  const formatDate = (d?: string | Date) => {
    if (!d) return "-";
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="w-full mt-4 relative">
      
      {/* 관리자 생성 버튼 */}
      {role === 'super' && (
        <div className="flex justify-end mb-6">
          <Link 
            href="/program/create"
            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            프로그램 생성
          </Link>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
          <p className="font-bold">프로그램 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <ServerOff className="w-10 h-10" />
          <p className="font-bold">데이터를 불러오는 데 실패했습니다.</p>
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && !error && programs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Calendar className="w-10 h-10" />
          <p className="font-bold">진행 중인 프로그램이 없습니다.</p>
        </div>
      )}

      {/* 목록 */}
      {!loading && !error && programs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 relative">
          {/* 가운데 기준선 (데스크탑 이상) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>
          
          {programs.map((prog, index) => {
            const progId = prog.id ?? (prog as any).id ?? String(index);
            
            const imageUrl = (prog as any).poster;
            const viewImage = getImage(imageUrl);

            return (
              <Link
                key={progId}
                href={`/program/${progId}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col md:flex-row aspect-[16/10] relative"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1.5 rounded-full text-xs font-black shadow-md bg-red-600 text-white tracking-wide border border-red-700/50">
                    D-{calculateDDay(prog.endDate)}
                  </span>
                </div>

                <div className="relative w-full md:w-1/2 h-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  <Image
                    src={viewImage}
                    alt={prog.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 md:p-8 flex flex-col justify-center flex-1 h-full overflow-hidden">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug group-hover:text-yonsei-blue transition-colors mb-4 line-clamp-3">
                    {prog.title}
                  </h2>
                  <div className="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm pt-4 border-t border-gray-100">
                    <span className="text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 block truncate">
                      {formatDate(prog.startDate)} ~ {formatDate(prog.endDate)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && pagination && (
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

export default function ProgramListPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">프로그램 목록을 불러오는 중...</p>
      </div>
    }>
      <ProgramListContent />
    </Suspense>
  );
}

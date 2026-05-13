'use client';

import { useEffect, useState } from 'react';
import { postNotice } from '@/api/post';
import Link from 'next/link';
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, X, Loader2, Pin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Notice, PaginationInfo } from '@/interface/interface';
import { getCommunityNotices } from '@/api/get';
import Pagination from '@/components/common/Pagination';

import { Suspense } from 'react';

function NoticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const { role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCommunityNotices(page, 10);
        if (data) {
          setNotices(data.items || []);
          setPagination(data.pagination);
        } else {
          setNotices([]);
        }
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(`/community/notice?page=${newPage}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("제목과 본문을 입력해주세요.");
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("isPinned", String(isPinned));

    if (files) {
      Array.from(files).forEach(file => {
        formData.append("files", file);
      });
    }

    const res = await postNotice(formData);
    setIsPending(false);

    if (res.success) {
      alert("공지사항이 성공적으로 등록되었습니다.");
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setContent("");
      setIsPinned(false);
      setFiles(null);
      
      window.location.reload();
    } else {
      alert(res.message || "등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full">
      {role === 'super' && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-yonsei-blue text-white hover:bg-blue-800 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            공지사항 생성
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-black text-gray-900">새 공지사항 생성</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition" 
                  placeholder="공지사항 제목 입력" 
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input 
                  id="isPinned"
                  type="checkbox" 
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-yonsei-blue border-gray-300 rounded focus:ring-yonsei-blue cursor-pointer" 
                />
                <label htmlFor="isPinned" className="text-sm font-bold text-gray-700 cursor-pointer select-none">상단 고정 공지로 설정</label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">본문</label>
                <textarea 
                  rows={8} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition resize-none" 
                  placeholder="본문 내용을 입력하세요..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">관련 파일 첨부</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setFiles(e.target.files)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition">취소</button>
              <button 
                onClick={handleSubmit} 
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <th className="px-6 py-4 w-16 text-center">번호</th>
                <th className="px-6 py-4 text-center">제목</th>
                <th className="px-6 py-4 w-32 text-center">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.length > 0 ? (
                // Sort pinned notices to the top if not already sorted by backend
                [...notices].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map((nt, idx) => (
                  <tr key={nt.id || idx} className={`transition-colors ${nt.isPinned ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 text-center text-gray-400 font-medium">
                      {nt.isPinned ? (
                        <div className="flex items-center justify-center">
                          <Pin className="w-5 h-5 text-yonsei-blue fill-yonsei-blue -rotate-45" />
                        </div>
                      ) : (
                        notices.length - idx
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/community/notice/${nt.id}`} className={`font-bold transition-colors block truncate w-full max-w-lg mx-auto text-center ${nt.isPinned ? 'text-yonsei-blue' : 'text-gray-900 hover:text-yonsei-blue'}`}>
                        {nt.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-400">
                      {nt.createdAt ? new Date(nt.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold">
                    등록된 공지사항이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

export default function NoticePage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">공지사항을 불러오는 중...</p>
      </div>
    }>
      <NoticeContent />
    </Suspense>
  );
}

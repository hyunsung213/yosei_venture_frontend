'use client';

import { postQA } from '@/api/post';
import { ChevronDown, ChevronUp, MessageSquarePlus, X, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Qa, PaginationInfo } from '@/interface/interface';
import { useEffect, useState } from 'react';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { ShieldAlert } from 'lucide-react';
import { getQAById, getWaveQAs } from '@/api/get';
import Link from 'next/link';

export default function WaveQAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [qas, setQas] = useState<Qa[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Creation Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  async function load(currentPage: number) {
    setLoading(true);
    try {
      const data = await getWaveQAs(currentPage, 10);
      if (data) {
        setQas(data.items || []);
        setPagination(data.pagination);
      } else {
        setQas([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role === 'guest') {
      router.push('/auth/login?redirect=/wave/qa');
      return;
    }
    load(page);
  }, [role, page]);

  const handlePageChange = (newPage: number) => {
    router.push(`/wave/qa?page=${newPage}`);
  };

  const handleCreate = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setIsPending(true);
    const res = await postQA({
      title,
      content,
      pwd: passwordInput || "0000",
      isWave: true
    });
    setIsPending(false);

    if (res.success) {
      alert("상담글이 등록되었습니다.");
      setIsModalOpen(false);
      if (page === 1) {
        load(1);
      } else {
        router.push(`/wave/qa?page=1`);
      }
    } else {
      alert(res.message || "등록 실패");
    }
  };

  // Mock user profile data based on role
  const mockProfile = {
    name: role === 'guest' ? '' : '홍길동',
    team: role === 'wave' ? 'Team Alpha (WAVE)' : role === 'general' ? '입주기업 A' : '',
    phone: role === 'guest' ? '' : '010-1234-5678',
  };

  if (role === 'general' || role === 'guest') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-gray-500 font-bold tracking-tight">Wave팀 전용 페이지입니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 질문하기 버튼 (우측 상단) */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-yonsei-blue text-white hover:bg-blue-800 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
        >
          <MessageSquarePlus className="w-5 h-5" />
          질문하기
        </button>
      </div>

      {/* 질문 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-black text-gray-900">Q&A 질문 등록</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* 입력 폼 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition" 
                  placeholder="질문 제목 입력" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">본문</label>
                <textarea 
                  rows={6} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition resize-none" 
                  placeholder="질문하실 내용을 상세히 적어주세요..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="animate-in fade-in flex flex-col justify-end">
                  <label className="block text-sm font-bold text-gray-700 mb-1">임시 비밀번호</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition font-mono tracking-widest" 
                    placeholder="숫자 4자리 입력" 
                  />
                  <div className="text-sm text-gray-500 font-medium mt-2">
                    * 비밀번호 미설정 시 0000이 임시비밀번호로 설정됩니다.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition"
              >
                취소
              </button>
              <button 
                onClick={handleCreate} 
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition shadow-md flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
            <p>로딩 중...</p>
          </div>
        ) : qas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  <th className="px-6 py-4 w-20 text-center">번호</th>
                  <th className="px-4 py-4 w-24 text-center">상태</th>
                  <th className="px-6 py-4 text-center">제목</th>
                  <th className="px-6 py-4 w-32 text-center">작성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {qas.map((qa, idx) => {
                  const number = pagination ? pagination.totalItems - ((pagination.page - 1) * pagination.limit) - idx : qas.length - idx;
                  return (
                    <tr key={qa.id || idx} className="odd:bg-white even:bg-slate-50 hover:bg-gray-100 transition-colors group">
                      <td className="px-6 py-4 text-center text-gray-400 font-medium">
                        {number}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[10px] px-2 py-1 rounded font-black whitespace-nowrap inline-block ${
                          qa.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {qa.status === 'answered' ? '답변완료' : '답변 대기중'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/wave/qa/${qa.id}`} className="flex items-center justify-center gap-2 font-bold text-gray-900 hover:text-yonsei-blue transition-colors w-full max-w-lg mx-auto">
                          <span className="truncate">{qa.title}</span>
                          <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">
                        {qa.createdAt ? new Date(qa.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
            <p>등록된 Q&A가 없습니다.</p>
          </div>
        )}
      </div>

      {!loading && pagination && (
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

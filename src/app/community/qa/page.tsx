'use client';

import { getAllCommunityQAs, getQAById } from '@/api/get';
import { postQA } from '@/api/post';
import { ChevronDown, ChevronUp, MessageSquarePlus, X, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Qa } from '@/interface/interface';
import { useEffect, useState } from 'react';

export default function QAPage() {
  const [qas, setQas] = useState<Qa[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { role, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  // Creation Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isOpenInput, setIsOpenInput] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");

  // Private Access State
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [accessPassword, setAccessPassword] = useState("");
  const [isAccessing, setIsAccessing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllCommunityQAs();
      setQas(data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    if (!isOpenInput && !passwordInput) {
      alert("비공개 시 패스워드를 입력해주세요.");
      return;
    }

    setIsPending(true);
    const res = await postQA({
      title,
      content,
      isOpen: isOpenInput,
      pw: passwordInput,
      isWave: false
    });
    setIsPending(false);

    if (res.success) {
      alert("상담글이 등록되었습니다.");
      setIsModalOpen(false);
      load();
    } else {
      alert(res.message || "등록 실패");
    }
  };

  const handleToggleOpen = async (qa: Qa) => {
    const isCurrentlyOpen = openId === qa._id;
    if (isCurrentlyOpen) {
      setOpenId(null);
      return;
    }

    // 관리자이거나 공개글이면 바로 내용 조회
    if (isAdmin || qa.isOpen) {
      await fetchDetail(qa._id!);
    } else {
      // 비공개글이면 패스워드 입력 유도
      setTargetId(qa._id!);
      setShowPasswordPrompt(true);
    }
  };

  const fetchDetail = async (id: string, pw?: string) => {
    setIsAccessing(true);
    const data = await getQAById(id, pw);
    setIsAccessing(false);

    if (data) {
      setQas(prev => prev.map(item => item._id === id ? { ...item, content: data.content } : item));
      setOpenId(id);
      setShowPasswordPrompt(false);
      setAccessPassword("");
    } else {
      alert("접근 권한이 없거나 비밀번호가 틀렸습니다.");
    }
  };

  // Mock user profile data based on role
  const mockProfile = {
    name: role === 'guest' ? '' : '홍길동',
    team: role === 'wave' ? 'Team Alpha (WAVE)' : role === 'general' ? '입주기업 우수' : '',
    phone: role === 'guest' ? '' : '010-1234-5678',
  };

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
              {/* 자동 입력된 사용자 정보 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider">등록자 정보 (자동 입력)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">이름</label>
                    <input type="text" value={mockProfile.name} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">연락처</label>
                    <input type="text" value={mockProfile.phone} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 font-medium" />
                  </div>
                  {(role === 'wave' || role === 'general') && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">소속 팀/기업</label>
                      <input type="text" value={mockProfile.team} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 font-medium" />
                    </div>
                  )}
                </div>
              </div>

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
                <div className="flex flex-col gap-3">
                  <label className="block text-sm font-bold text-gray-700">공개 여부</label>
                  <div className="flex items-center gap-6 h-[42px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="visibility" 
                        checked={isOpenInput} 
                        onChange={() => setIsOpenInput(true)} 
                        className="w-4 h-4 text-yonsei-blue focus:ring-yonsei-blue" 
                      />
                      <span className="text-gray-700 font-medium text-sm">공개</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="visibility" 
                        checked={!isOpenInput} 
                        onChange={() => setIsOpenInput(false)} 
                        className="w-4 h-4 text-yonsei-blue focus:ring-yonsei-blue" 
                      />
                      <span className="text-gray-700 font-medium text-sm">비공개</span>
                    </label>
                  </div>
                </div>

                {!isOpenInput && (
                  <div className="animate-in fade-in slide-in-from-right-2 flex flex-col justify-end">
                    <label className="block text-sm font-bold text-gray-700 mb-1">임시 비밀번호 <span className="text-red-500">*</span></label>
                    <input 
                      type="password" 
                      maxLength={4} 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition font-mono tracking-widest" 
                      placeholder="숫자 4자리 입력" 
                    />
                  </div>
                )}
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

      {/* 비밀번호 입력 프롬프트 */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              비밀글 열람
            </h3>
            <p className="text-sm text-gray-500 font-medium">상담글 작성 시 설정한 비밀번호 4자리를 입력해주세요.</p>
            <input 
              type="password" 
              maxLength={4} 
              autoFocus
              value={accessPassword}
              onChange={(e) => setAccessPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yonsei-blue outline-none text-center font-mono text-2xl tracking-[1em]" 
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPasswordPrompt(false)} 
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
              >
                취소
              </button>
              <button 
                onClick={() => fetchDetail(targetId!, accessPassword)}
                disabled={isAccessing}
                className="flex-1 py-3 rounded-xl bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                {isAccessing && <Loader2 className="w-4 h-4 animate-spin" />}
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {qas.length > 0 ? (
          <div className="space-y-4">
            {qas.map((qa, idx) => {
               const isOpen = openId === qa._id;
               return (
                 <div key={qa._id || idx} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
                   <button 
                     onClick={() => handleToggleOpen(qa)}
                     className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                   >
                     <div className="flex items-center gap-4">
                       <span className="text-yonsei-blue font-black font-serif text-xl">Q.</span>
                       <div className="flex items-center gap-2">
                         {!qa.isOpen && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                         <span className="font-bold text-gray-900">{qa.title}</span>
                         {qa.state === 'completed' && (
                           <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-black">답변완료</span>
                         )}
                       </div>
                     </div>
                     {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                   </button>
                   
                   {isOpen && (
                     <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                       <span className="text-red-500 font-black font-serif text-xl">A.</span>
                       <p className="text-gray-600 leading-relaxed font-medium mt-1 break-keep">
                         {qa.content || "답변을 준비중입니다."}
                       </p>
                     </div>
                   )}
                 </div>
               )
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 font-bold flex flex-col items-center gap-2">
            <p>등록된 Q&A가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

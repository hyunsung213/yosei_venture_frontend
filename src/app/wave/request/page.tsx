"use client";

import { getAllRequests, getRequestById, getMe, getTeamByUserId, getTeamById, getCommentsByRequestId, getRequestsByTeamId } from '@/api/get';
import { postRequest, postComment } from '@/api/post';
import { putRequest, putRequestStatus } from '@/api/put';
import { PlusCircle, X, Loader2, Lock, FileText, Download, Building, DollarSign, Tag, ShieldAlert, MessageSquare, CheckCircle, XCircle, Edit, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Request, IRequest, Team } from '@/interface/interface';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getImage } from '@/utils/imageUtils';

export default function WaveRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, userId, isLoaded } = useAuth();
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pw, setPw] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [use, setUse] = useState<IRequest["use"]>("etc");
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState("");

  // Detail / Password State
  const [selectedReq, setSelectedReq] = useState<Request | null>(null);
  const [showPwPrompt, setShowPwPrompt] = useState(false);
  const [accessPw, setAccessPw] = useState("");
  const [isAccessing, setIsAccessing] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [teamInfo, setTeamInfo] = useState<Team | null>(null);
  const [teamRequests, setTeamRequests] = useState<Request[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;

    if (role === 'guest') {
      router.push('/auth/login?redirect=/wave/request');
      return;
    }
    load();
    if (role === 'wave' && userId) {
      fetchUserInfo(userId);
    }
  }, [role, userId, isLoaded]);

  async function fetchUserInfo(uid: string) {
    const team = await getTeamByUserId(uid);
    if (team) {
      console.log(team)
      setTeamName(team[0]);
      setTeamId(team[0].id);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">승인</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-50 text-red-700 border border-red-200">반려</span>;
      case 'pending':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">검토대기</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200">{status}</span>;
    }
  };

  const useLabels: Record<string, string> = {
    promotion: "홍보비",
    cloude: "클라우드 이용료",
    prototype: "시제품 제작비",
    etc: "기타"
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !pw || !teamId) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("pw", pw);
    formData.append("cost", cost.toString());
    formData.append("use", use);
    formData.append("teamId", teamId);
    
    if (files) {
      Array.from(files).forEach(f => formData.append("files", f));
    }

    try {
        let res;
        if (isEditMode && selectedReq) {
            res = await putRequest(selectedReq.id, formData);
        } else {
            res = await postRequest(formData);
        }

        if (res.success) {
          alert(isEditMode ? "사업비 처리 요청이 수정되었습니다." : "사업비 처리 요청이 등록되었습니다.");
          setIsModalOpen(false);
          resetForm();
          load();
        } else {
          alert(res.message);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsPending(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPw("");
    setCost(0);
    setUse("etc");
    setFiles(null);
    setIsEditMode(false);
  };

  const handleRowClick = (req: Request) => {
    router.push(`/wave/request/${req.id}`);
  };

  if (role === 'general') {
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

  if (role === 'guest') return null;

  return (
    <div className="space-y-6">
      {/* 상단 액션 바 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900">사업비 및 행정 처리 요청</h2>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-yonsei-blue text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          신규 요청 등록
        </button>
      </div>

      {/* 요청 작성 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-black text-gray-900">
                {isEditMode ? "처리 요청 수정" : "처리 요청 등록"}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setIsEditMode(false); }} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none" 
                  placeholder="요청 건명 입력" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">상세 내용</label>
                <textarea 
                  rows={6} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none resize-none" 
                  placeholder="처리 요청 내용을 상세히 적어주세요."
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">비밀번호 (열람용)</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none font-mono" 
                    placeholder="숫자 4자리" 
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">증빙 파일 첨부</label>
                   <input 
                    type="file" 
                    multiple 
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100" 
                   />
                </div>
              </div>

              {/* 신규 추가 필드: 팀 정보(wave), 비용, 용도 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                {role === 'wave' && (
                  <div className="md:col-span-2">
                    <label className="flex items-split gap-2 text-sm font-bold text-gray-700 mb-1">
                      <Building className="w-4 h-4 text-yonsei-blue" />
                      신청 팀
                    </label>
                    <input 
                      type="text" 
                      value={teamName} 
                      readOnly 
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 font-bold outline-none" 
                    />
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                    <DollarSign className="w-4 h-4 text-yonsei-blue" />
                    신청 비용 (원)
                  </label>
                  <div className="relative w-full">
                    <input 
                      type="text" 
                      value={cost === 0 ? "" : cost.toLocaleString()} 
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setCost(Number(rawValue));
                      }}
                      className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none font-bold text-right" 
                      placeholder="0" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold pointer-events-none">
                      원
                    </span>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                    <Tag className="w-4 h-4 text-yonsei-blue" />
                    비용 용도
                  </label>
                  <select 
                    value={use}
                    onChange={(e) => setUse(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none bg-white font-bold"
                  >
                    <option value="promotion">홍보비</option>
                    <option value="cloude">클라우드 이용료</option>
                    <option value="prototype">시제품 제작비</option>
                    <option value="etc">기타</option>
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  요청 글은 비공개로 등록되며, 설정하신 비밀번호를 통해 본인 및 관리자만 확인이 가능합니다. 증빙 서류(영수증, 견적서 등)를 반드시 첨부해 주세요.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition">취소</button>
                <button type="submit" disabled={isPending} className="px-8 py-2.5 rounded-lg bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition shadow-md flex items-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEditMode ? "수정완료" : "요청하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 리스트 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
            <p className="font-bold">요청 내역을 불러오는 중...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-16 text-center">번호</th>
                  <th className="px-6 py-4 text-center">요청 건명 (비공개)</th>
                  <th className="px-6 py-4 w-32 text-center">작성일자</th>
                  <th className="px-6 py-4 w-40 text-center">결재상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.length > 0 ? (
                  requests.map((req, idx) => (
                    <tr 
                      key={req.id || idx} 
                      onClick={() => handleRowClick(req)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 text-center text-gray-400 font-medium">{requests.length - idx}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold text-gray-900 group-hover:text-yonsei-blue transition-colors">
                            {req.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-400">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(req.state)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold">
                      등록된 처리 요청 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


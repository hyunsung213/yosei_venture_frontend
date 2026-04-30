'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getTeamByUserIdWithPlan } from "@/api/get";
import { putUsage } from "@/api/put";
import { postComment } from "@/api/post";
import { Usage } from "@/interface/interface";
import { ArrowLeft, Loader2, Save, Upload, FileText } from "lucide-react";
import Link from "next/link";

export default function WaveTeamUsageDetailPage() {
  const { role, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const usageId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [planIsEdit, setPlanIsEdit] = useState(false);
  const [teamBalance, setTeamBalance] = useState(0);

  // Form states
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [useFor, setUseFor] = useState("");
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Super action state
  const [superComment, setSuperComment] = useState("");

  const [errorPrompt, setErrorPrompt] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (userId) {
        const teamData = await getTeamByUserIdWithPlan(userId);
        if (teamData) {
          if (teamData.plan) setPlanIsEdit(!!teamData.plan.isEdit);
          setTeamBalance(teamData.balance || 0);
          if (teamData.usages) {
            const found = teamData.usages.find(u => u.id === usageId || (u as any)._id === usageId);
            if (found) {
              setUsage(found);
              setDate(found.date ? new Date(found.date).toISOString().split('T')[0] : "");
              setType(found.type || "");
              setUseFor(found.for || "");
              setCost(found.cost || 0);
              setNote(found.note || "");
            }
          }
        }
      }
      setIsLoading(false);
    };

    if (role === "wave" || role === "super") {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [role, userId, usageId]);

  if (isLoading) {
    return (
      <ProtectedRoute minRole="wave">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!usage) {
    return (
      <ProtectedRoute minRole="wave">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center flex flex-col items-center gap-4">
          <p className="text-gray-500 font-bold">해당 사용 내역을 찾을 수 없습니다.</p>
          <button onClick={() => router.back()} className="text-yonsei-blue hover:underline text-sm font-bold">뒤로 가기</button>
        </div>
      </ProtectedRoute>
    );
  }

  // 1. tentative && isEdit -> 수정 가능
  // 2. step=approoval && status=rejected -> 다시 요청하기 (전체 수정 가능)
  const canEditBody = (planIsEdit && usage.step === "tentative") || (usage.step === "approoval" && usage.status === "rejected");

  // 3. 파일 업로드 가능 구간
  // 3-1: step=approoval && status=approved
  // 3-2: step=finalization && status=rejected
  const canUploadFile = (usage.step === "approoval" && usage.status === "approved") || (usage.step === "finalization" && usage.status === "rejected");

  // 관리자 검토 권한
  const isSuperReviewRequest = role === "super" && usage.step === "request" && usage.status === "pending";
  const isSuperReviewSubmission = role === "super" && usage.step === "submission" && usage.status === "pending";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">승인</span>;
      case "rejected": return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">반려</span>;
      case "pending": return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">처리대기</span>;
      case "tentative": return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">임시저장</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const renderStepper = (step: string) => {
    const displaySteps = [
      { id: 'request', label: '사용 승인 요청' },
      { id: 'approoval', label: '승인 여부' },
      { id: 'submission', label: '사용보고서 제출' },
      { id: 'finalization', label: '최종 승인' }
    ];
    
    let currentStepIndex = 0;
    if (step === 'request') currentStepIndex = 0;
    if (step === 'approoval') currentStepIndex = 1;
    if (step === 'submission') currentStepIndex = 2;
    if (step === 'finalization') currentStepIndex = 3;

    return (
      <div className="flex items-center gap-2 text-sm font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm overflow-x-auto">
        {displaySteps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <span className={idx === currentStepIndex ? "bg-yonsei-blue text-white px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm" : "text-gray-400 whitespace-nowrap px-2"}>
              {s.label}
            </span>
            {idx < displaySteps.length - 1 && <span className="text-gray-300 font-bold">{'>'}</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const executePut = async (updateData: any) => {
    setIsSaving(true);
    setErrorPrompt("");
    const res = await putUsage(usageId, updateData);
    setIsSaving(false);
    if (res.success) {
      alert("성공적으로 처리되었습니다.");
      window.location.reload(); // Refresh to see updated status
    } else {
      setErrorPrompt(res.message);
    }
  };

  const handleSaveBody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditBody) return;
    executePut({ date, type, for: useFor, cost, note });
  };

  const handleRequestApproval = () => {
    if (!window.confirm("승인 요청을 하시겠습니까? 요청 후에는 수정이 불가능합니다.")) return;
    executePut({ date, type, for: useFor, cost, note, status: 'pending', step: 'request' });
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadFile) return;
    if (!file) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("status", "pending");
    formData.append("step", "submission");
    executePut(formData);
  };

  const handleSuperAction = async (actionStatus: 'approved' | 'rejected') => {
    if (!window.confirm(`정말로 ${actionStatus === 'approved' ? '승인' : '반려'}하시겠습니까?`)) return;
    let nextStep = usage.step;
    if (usage.step === 'request') nextStep = 'approoval';
    if (usage.step === 'submission') nextStep = 'finalization';
    
    if (superComment.trim()) {
      await postComment({ foreignId: usageId, content: superComment });
    }
    
    executePut({ status: actionStatus, step: nextStep });
  };

  const sortedComments = usage.comments ? [...usage.comments].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) : [];

  return (
    <ProtectedRoute minRole="wave">
      <div className="max-w-5xl mx-auto px-4 py-8 mt-4">
        <Link
          href="/wave/team"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          팀 대시보드로 돌아가기
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">사용 내역 상세</h1>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">상태:</span>
                {getStatusBadge(usage.status)}
              </div>
            </div>
            {renderStepper(usage.step)}
          </div>

          {!canEditBody && !canUploadFile && !isSuperReviewRequest && !isSuperReviewSubmission && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm font-bold">
              * 현재 상태에서는 이 내역을 수정할 수 없습니다.
            </div>
          )}

          <form onSubmit={handleSaveBody} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">사용 일자</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={!canEditBody}
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">분류 (Type)</label>
                <input
                  type="text"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={!canEditBody}
                  placeholder="예: 회의비, 도서구입비"
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-gray-700 mb-2">사용 목적 및 내용 (For)</label>
                <input
                  type="text"
                  required
                  value={useFor}
                  onChange={(e) => setUseFor(e.target.value)}
                  disabled={!canEditBody}
                  placeholder="구체적인 사용 내역을 적어주세요."
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">사용 금액 (원)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cost ? cost.toLocaleString() : ""}
                    onChange={(e) => {
                      let val = Number(e.target.value.replace(/,/g, '')) || 0;
                      if (teamBalance > 0 && val > teamBalance) val = teamBalance;
                      setCost(val);
                    }}
                    disabled={!canEditBody}
                    className="w-full border border-gray-200 py-3 px-4 pr-10 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none disabled:bg-gray-50 disabled:text-gray-500 text-right font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">원</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-gray-700 mb-2">비고 (Note)</label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!canEditBody}
                  placeholder="추가적인 참고사항이나 증빙 내역을 적어주세요."
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none disabled:bg-gray-50 disabled:text-gray-500 resize-y"
                />
              </div>
            </div>

            {canEditBody && (
              <div className="pt-6 border-t border-gray-100 flex justify-end gap-4 mt-4">
                {(usage.step === 'tentative' || (usage.step === 'approoval' && usage.status === 'rejected')) && (
                  <button
                    type="button"
                    onClick={handleRequestApproval}
                    disabled={isSaving}
                    className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-yonsei-blue bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {usage.step === 'tentative' ? "승인 요청하기" : "다시 요청하기"}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "저장 중..." : "수정 완료"}
                </button>
              </div>
            )}
          </form>

          {/* 등록된 파일 정보 표시 */}
          {usage.file && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">제출된 보고서 파일</h3>
              <a href={usage.file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-yonsei-blue font-bold text-sm transition-colors">
                <FileText className="w-4 h-4" />
                다운로드 및 확인하기
              </a>
            </div>
          )}

          {/* 파일 업로드 폼 (보고서 제출 혹은 재업로드 구간) */}
          {canUploadFile && (
            <form onSubmit={handleUploadFile} className="mt-8 border-t border-gray-100 pt-6 bg-blue-50/50 p-6 rounded-xl border-dashed border-2 border-blue-200">
              <h3 className="text-lg font-bold text-yonsei-blue mb-2">보고서 파일 업로드</h3>
              <p className={`text-sm mb-4 font-bold ${usage.status === 'rejected' ? 'text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 inline-block' : 'text-gray-500'}`}>
                {usage.status === 'rejected' ? '🚨 반려 사유를 확인하고 보고서를 다시 업로드해주세요.' : '승인된 내역에 대해 결과 보고서 및 증빙 자료를 업로드해주세요.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="flex-1 bg-white border border-blue-200 p-2 rounded-lg text-sm w-full"
                />
                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-6 py-3 bg-yonsei-blue text-white rounded-xl font-bold shadow-sm hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0">
                  <Upload className="w-4 h-4" />
                  업로드하기
                </button>
              </div>
            </form>
          )}

          {/* Super 관리자 권한 (승인/반려 폼) */}
          {(isSuperReviewRequest || isSuperReviewSubmission) && (
            <div className="mt-8 border-t border-gray-100 pt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-black text-gray-900 mb-4">관리자 검토 ({isSuperReviewRequest ? "사용 승인" : "최종 승인"})</h3>
              <textarea
                rows={3}
                value={superComment}
                onChange={(e) => setSuperComment(e.target.value)}
                placeholder="승인 또는 반려 사유 (코멘트)를 남겨주세요."
                className="w-full border border-gray-200 py-3 px-4 rounded-xl mb-4 focus:ring-2 focus:ring-yonsei-blue/50 outline-none"
              />
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => handleSuperAction('rejected')}
                  disabled={isSaving}
                  className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  반려
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSuperAction('approved')}
                  disabled={isSaving}
                  className="px-6 py-3 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  승인
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorPrompt && (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl font-bold border border-red-100 mt-4">
              {errorPrompt}
            </div>
          )}

          {/* Comments List */}
          {sortedComments.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">관리자 코멘트 히스토리</h3>
              <div className="space-y-4">
                {sortedComments.map((comment) => (
                  <div key={comment.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm relative">
                    <span className="absolute top-4 right-5 text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                    </span>
                    <p className="whitespace-pre-wrap text-gray-800 text-sm pr-20 leading-relaxed font-medium">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

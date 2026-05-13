'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getTeamByUserIdWithPlan, getUsageById } from "@/api/get";
import { putUsage } from "@/api/put";
import { postComment } from "@/api/post";
import { Usage, UsageDetail } from "@/interface/interface";
import { ArrowLeft, Loader2, Save, Upload, FileText } from "lucide-react";
import Link from "next/link";
import { UsageType, UsageTypeKo, TeamType } from "@/interface/interface";
import { validateUsageBudget, getMaxLimitText } from "@/utils/validation";

const usageTypeMap: Record<UsageType, UsageTypeKo> = {
  supplies: "사무용품",
  promotion: "인쇄물 및 홍보물",
  meetings: "회의비",
  registration: "참가비",
  materials: "재료비",
  outsourcing: "용역비"
};

export default function WaveTeamUsageDetailPage() {
  const { role, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const usageId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usage, setUsage] = useState<UsageDetail | null>(null);
  const [teamBalance, setTeamBalance] = useState(0);
  const [teamType, setTeamType] = useState<TeamType | undefined>(undefined);
  const [usages, setUsages] = useState<Usage[]>([]);

  // Form states
  const [date, setDate] = useState("");
  const [type, setType] = useState<UsageType | "">("");
  const [useFor, setUseFor] = useState("");
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Super action state
  const [superComment, setSuperComment] = useState("");

  const [errorPrompt, setErrorPrompt] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (userId) {
        const [teamData, usageData] = await Promise.all([
          getTeamByUserIdWithPlan(userId),
          getUsageById(usageId)
        ]);

        if (teamData) {
          setTeamBalance(teamData.balance || 0);
          setTeamType(teamData.type);
          setUsages(teamData.usages || []);
        }

        if (usageData) {
          setUsage(usageData);
          setDate(usageData.date ? new Date(usageData.date).toISOString().split('T')[0] : "");
          setType((usageData.type as UsageType) || "");
          setUseFor(usageData.for || "");
          setCost(usageData.cost || 0);
          setNote(usageData.note || "");
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

  const currentAccumulatedCost = React.useMemo(() => {
    if (!type) return 0;
    return usages
      .filter((u) => u.type === type && u.id !== usageId && (u as any)._id !== usageId)
      .reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  }, [usages, type, usageId]);

  const limitText = React.useMemo(() => {
    if (!type) return "";
    return getMaxLimitText(type as UsageType, teamType, teamBalance, currentAccumulatedCost);
  }, [type, teamType, teamBalance, currentAccumulatedCost]);

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

  // 1. step=approoval && status=rejected -> 다시 요청하기 (전체 수정 가능)
  const canEditBody = (usage.step === "approoval" && usage.status === "rejected");

  // 3. 파일 업로드 가능 구간
  // 3-1: step=approoval && status=approved
  // 3-2: step=finalization && status=rejected
  const canUploadFile = (usage.step === "approoval" && usage.status === "approved") || (usage.step === "finalization" && usage.status === "rejected");

  // 관리자 검토 권한
  const isSuperReviewRequest = role === "super" && usage.step === "request" && usage.status === "pending";
  const isSuperReviewSubmission = role === "super" && usage.step === "submission" && usage.status === "pending";

  const getCombinedBadge = (step: string, status: string, isMissingFile?: boolean) => {
    let stepColor = "";
    let stepText = "";
    switch (step) {
      case 'request': stepText = "신청"; stepColor = "bg-[#E1B1E8]"; break;
      case 'approoval': stepText = "검토"; stepColor = "bg-[#A18DDD]"; break;
      case 'submission': stepText = "증빙"; stepColor = "bg-[#8182DA]"; break;
      case 'finalization': stepText = "검수"; stepColor = "bg-[#5756BB]"; break;
      default: stepText = "-"; stepColor = "bg-gray-400"; break;
    }

    let statusText = "";
    let statusColor = "";
    if (isMissingFile) {
      statusText = "-"; statusColor = "text-gray-500 bg-gray-100";
    } else {
      switch (status) {
        case "approved": statusText = "승인"; statusColor = "text-green-700 bg-green-100"; break;
        case "rejected": statusText = "반려"; statusColor = "text-red-700 bg-red-100"; break;
        case "pending": statusText = "처리대기"; statusColor = "text-yellow-700 bg-yellow-100"; break;
        case "tentative": statusText = "임시저장"; statusColor = "text-gray-700 bg-gray-100"; break;
        default: statusText = status; statusColor = "text-gray-700 bg-gray-100"; break;
      }
    }

    return (
      <div className="flex items-center gap-1.5 font-bold">
        <span className={`${stepColor} text-white px-2 py-1 rounded-full text-xs tracking-wide`}>{stepText}</span>
        <span className="text-gray-400">-</span>
        <span className={`${statusColor} px-2 py-1 rounded-full text-xs tracking-wide`}>{statusText}</span>
      </div>
    );
  };

  const renderStepper = (step: string) => {
    const displaySteps = [
      { id: 'request', label: '신청', activeClass: 'bg-[#E1B1E8] text-white' },
      { id: 'approoval', label: '검토', activeClass: 'bg-[#A18DDD] text-white' },
      { id: 'submission', label: '증빙', activeClass: 'bg-[#8182DA] text-white' },
      { id: 'finalization', label: '검수', activeClass: 'bg-[#5756BB] text-white' }
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
            <span className={idx === currentStepIndex ? `${s.activeClass} px-4 py-1.5 rounded-full whitespace-nowrap shadow-sm` : "text-gray-400 whitespace-nowrap px-2"}>
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

  const validateCurrentUsage = () => {
    if (!type) {
      setErrorPrompt("분류를 선택해주세요.");
      return false;
    }

    const validation = validateUsageBudget(
      type as UsageType,
      cost,
      teamType,
      teamBalance,
      currentAccumulatedCost
    );

    if (!validation.isValid) {
      setErrorPrompt(validation.message);
      return false;
    }
    return true;
  };

  const handleSaveBody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditBody) return;
    if (!validateCurrentUsage()) return;

    const formData = new FormData();
    formData.append("date", date);
    formData.append("type", type);
    formData.append("for", useFor);
    formData.append("cost", String(cost));
    formData.append("note", note);
    formData.append("status", "pending");
    formData.append("step", "request");
    if (beforeFile) {
      formData.append("beforeFile", beforeFile);
    }
    executePut(formData);
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadFile) return;
    if (!afterFile) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("afterFile", afterFile);
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
                {getCombinedBadge(usage.step, usage.status)}
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
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value as UsageType)}
                  disabled={!canEditBody}
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none disabled:bg-gray-50 disabled:text-gray-500 bg-white text-gray-700"
                >
                  <option value="" disabled>분류를 선택해주세요</option>
                  {Object.entries(usageTypeMap).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
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
                {limitText && (
                  <p className="mt-2 text-xs font-bold text-gray-400">{limitText}</p>
                )}
              </div>

              {canEditBody && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-extrabold text-gray-700 mb-2">증빙 자료 수정 (신청 시)</label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-yonsei-blue/50 transition-colors bg-gray-50/30 group">
                    <input
                      type="file"
                      onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-yonsei-blue" />
                      </div>
                      <p className="text-sm font-bold text-gray-600">
                        {beforeFile ? beforeFile.name : "클릭하거나 파일을 여기로 끌어다 놓으세요"}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">새 파일을 업로드하려면 클릭하세요</p>
                    </div>
                  </div>
                </div>
              )}

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
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "요청 중..." : "다시 요청하기"}
                </button>
              </div>
            )}
          </form>

          {/* 등록된 파일 정보 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-gray-100 pt-8">
            {usage.beforeFile && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">신청 시 증빙 자료</h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-6 h-6 text-yonsei-blue flex-shrink-0" />
                    <span className="font-bold text-gray-700 truncate text-sm">신청 증빙 파일</span>
                  </div>
                  <a href={usage.beforeFile} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 bg-white hover:bg-yonsei-blue hover:text-white border border-gray-200 rounded-lg text-yonsei-blue font-bold text-xs transition-all shadow-sm">
                    확인하기
                  </a>
                </div>
              </div>
            )}
            
            {usage.afterFile && (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">최종 결과 보고서</h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="font-bold text-gray-700 truncate text-sm">결과 보고서 파일</span>
                  </div>
                  <a href={usage.afterFile} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 bg-white hover:bg-green-600 hover:text-white border border-gray-200 rounded-lg text-green-600 font-bold text-xs transition-all shadow-sm">
                    확인하기
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 파일 업로드 폼 (보고서 제출 혹은 재업로드 구간) */}
          {canUploadFile && (
            <form onSubmit={handleUploadFile} className="mt-8 bg-blue-50/50 p-8 rounded-2xl border-dashed border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yonsei-blue text-white rounded-lg shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900">보고서 제출</h3>
              </div>
              <p className={`text-sm mb-6 font-bold ${usage.status === 'rejected' ? 'text-red-600 bg-red-50 p-4 rounded-xl border border-red-100' : 'text-gray-500'}`}>
                {usage.status === 'rejected' ? '🚨 반려 사유를 확인하고 보고서를 다시 업로드해주세요.' : '승인된 내역에 대해 결과 보고서 및 증빙 자료를 업로드해주세요.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <input 
                  type="file" 
                  onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100 cursor-pointer"
                />
                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-8 py-3 bg-yonsei-blue text-white rounded-xl font-bold shadow-md hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                  {isSaving ? "업로드 중..." : "제출하기"}
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
                {sortedComments.map((comment, idx) => (
                  <div key={comment.id || idx} className={`p-5 bg-white border ${idx === 0 ? 'border-orange-300 shadow-md ring-2 ring-orange-100' : 'border-gray-200 shadow-sm'} rounded-xl relative`}>
                    <div className="absolute top-4 right-5 flex items-center gap-2">
                      {idx === 0 && (
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase shadow-sm">
                          Latest
                        </span>
                      )}
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-800 text-sm pr-24 leading-relaxed font-medium">
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

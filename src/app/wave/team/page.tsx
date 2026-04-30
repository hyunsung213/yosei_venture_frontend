'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getTeamByUserIdWithPlan, getTeamWithPlanById } from "@/api/get";
import { TeamWithPlan, Usage } from "@/interface/interface";
import { Loader2, Users, FileText, PlusCircle, Trash2, Download, Upload, CheckCircle, XCircle } from "lucide-react";
import { deleteUsage } from "@/api/delete";
import { putPlan } from "@/api/put";
import { postComment } from "@/api/post";
import { getImage } from "@/utils/imageUtils";

function WaveTeamDashboardContent() {
  const { role, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTeamId = searchParams.get('teamId');

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TeamWithPlan | null>(null);
  
  // 전체 사용계획서 관리용 State
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (queryTeamId) {
        const teamData = await getTeamWithPlanById(queryTeamId);
        setData(teamData ?? null);
      } else if (userId) {
        const teamData = await getTeamByUserIdWithPlan(userId);
        setData(teamData ?? null);
      }
      setIsLoading(false);
    };

    if (role === "wave" || role === "super") {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [role, userId, queryTeamId]);

  if (isLoading) {
    return (
      <ProtectedRoute minRole="wave">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute minRole="wave">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-500">
          팀 데이터를 불러올 수 없거나 소속된 팀이 없습니다.
        </div>
      </ProtectedRoute>
    );
  }

  const getStatusBadge = (status: string, isMissingFile?: boolean) => {
    if (isMissingFile) {
      return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-bold">-</span>;
    }
    switch (status) {
      case "approved": return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">승인</span>;
      case "rejected": return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">반려</span>;
      case "pending": return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">처리대기</span>;
      case "tentative": return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">임시저장</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'tentative': return '-';
      case 'request': return '사용 승인 요청';
      case 'approoval': return '승인 여부';
      case 'submission': return '사용보고서 제출';
      case 'finalization': return '최종 승인';
      default: return step;
    }
  };

  const calculateTotalUsage = (usages: Usage[]) => {
    return usages.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  };

  const totalUsed = calculateTotalUsage(data.usages || []);
  const remainBalance = data.balance - totalUsed;

  const handleDelete = async (e: React.MouseEvent, usageId: string) => {
    e.stopPropagation();
    if (!window.confirm("정말로 이 사용 내역을 삭제하시겠습니까?")) return;
    
    // API 호출로 삭제
    const res = await deleteUsage(usageId);
    if (res.success) {
      alert("삭제되었습니다.");
      window.location.reload(); // 간편한 리프레시
    } else {
      alert(res.message || "삭제 실패");
    }
  };

  const handleUploadPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("선택한 파일을 전체 사용계획서로 업로드하시겠습니까?")) {
      e.target.value = ''; // reset
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("status", "pending"); 

    const planId = data!.plan?.id || (data!.plan as any)?._id;
    const res = await putPlan(planId, formData);
    if (res.success) {
      alert("업로드 완료되었습니다.");
      window.location.reload();
    } else {
      alert(res.message || "업로드 실패");
    }
    setIsSubmitting(false);
  };

  const handleApprovePlan = async () => {
    if (!window.confirm("전체 사용계획서를 승인하시겠습니까?")) return;
    setIsSubmitting(true);
    const planId = data!.plan?.id || (data!.plan as any)?._id;
    const res = await putPlan(planId, { isEdit: false, status: "approved" });
    if (res.success) {
      alert("승인 처리되었습니다.");
      window.location.reload();
    } else {
      alert(res.message || "승인 실패");
    }
    setIsSubmitting(false);
  };

  const handleRejectPlan = async () => {
    if (!commentText.trim()) {
      alert("반려 사유(코멘트)를 작성해주세요.");
      return;
    }
    if (!window.confirm("전체 사용계획서를 반려하시겠습니까?")) return;
    setIsSubmitting(true);
    
    const planId = data!.plan?.id || (data!.plan as any)?._id;

    // 1. 코멘트 등록
    const commentRes = await postComment({ foreignId: planId, content: commentText });
    if (!commentRes.success) {
      alert(commentRes.message || "코멘트 등록 실패");
      setIsSubmitting(false);
      return;
    }

    // 2. 반려 상태 처리 (isEdit: true로 열어줌)
    const res = await putPlan(planId, { isEdit: true, status: "rejected" });
    if (res.success) {
      alert("반려 처리되었습니다.");
      window.location.reload();
    } else {
      alert(res.message || "반려 상태 업데이트 실패");
    }
    setIsSubmitting(false);
  };

  return (
    <ProtectedRoute minRole="wave">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">팀 관리 대시보드</h1>
          <p className="text-gray-500 mt-2">팀 기본 정보 및 예산/사용 내역을 한눈에 확인하세요.</p>
        </div>

        {/* Team Info Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              {data.img ? (
                <img src={getImage(data.img)} alt={data.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-yonsei-blue">
                  <Users className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-gray-900">{data.name}</h2>
                <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{data.type} Team</p>
              </div>
            </div>
            <p className="text-gray-700 font-medium whitespace-pre-wrap mb-6">{data.describe}</p>
            
            <h3 className="text-sm font-bold text-gray-400 mb-2">팀 멤버</h3>
            <div className="flex flex-wrap gap-2">
              {data.user?.map((member, idx) => (
                <span key={idx} className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700">
                  {member.name} <span className="text-gray-400">({member.studentId})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Budget Info */}
          <div className="bg-yonsei-blue/5 p-6 rounded-2xl shadow-sm border border-yonsei-blue/10 flex flex-col justify-center">
            <h3 className="text-lg font-black text-yonsei-blue mb-6">예산 현황</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">총 배정 예산</span>
                <span className="text-lg font-black text-gray-900">{data.balance?.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">사용 금액</span>
                <span className="text-lg font-black text-red-600">{totalUsed.toLocaleString()} 원</span>
              </div>
              <div className="w-full h-px bg-yonsei-blue/20 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">잔여 예산</span>
                <span className="text-2xl font-black text-yonsei-blue">{remainBalance.toLocaleString()} 원</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Usage Plan Box */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-yonsei-blue" />
              전체 사용계획서
            </h2>
            {getStatusBadge(data.plan?.status || "pending", !data.plan?.file)}
          </div>

          <div className="flex flex-col gap-6">
            {/* File Download / Upload Section */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full">
                {data.plan?.file ? (
                  <a 
                    href={getImage(data.plan.file)} 
                    target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Download className="w-5 h-5 text-yonsei-blue" />
                    계획서 다운로드
                  </a>
                ) : (
                  <div className="flex-1 py-3 text-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-xl bg-gray-50">
                    등록된 사용계획서 파일이 없습니다.
                  </div>
                )}
                
                {role === "wave" && data.plan?.isEdit && (!data.plan?.file || data.plan?.status === 'rejected') && (
                  <div className="flex-1 relative">
                    <input 
                      type="file" 
                      accept=".xlsx, .xls"
                      onChange={handleUploadPlan}
                      disabled={isSubmitting}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 py-3 bg-yonsei-blue text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-sm pointer-events-none">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {data.plan?.file ? "다시 업로드" : "계획서 업로드 (Excel)"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Controls */}
            {role === "super" && data.plan?.status !== "approved" && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">관리자 검토</h3>
                {isRejecting ? (
                  <div className="flex flex-col gap-3">
                    <textarea 
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="반려 사유를 상세히 적어주세요. (팀원들이 재작성 시 참고합니다)"
                      className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-y min-h-[100px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setIsRejecting(false)} className="px-4 py-2 rounded-lg text-gray-500 font-bold hover:bg-gray-100 text-sm transition-colors">취소</button>
                      <button onClick={handleRejectPlan} disabled={isSubmitting} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 text-sm disabled:opacity-50 transition-colors">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        반려
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={handleApprovePlan} 
                      disabled={isSubmitting || !data.plan?.file}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      승인 처리
                    </button>
                    <button 
                      onClick={() => setIsRejecting(true)}
                      disabled={isSubmitting || !data.plan?.file}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      반려 및 코멘트
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Comments List */}
            {data.plan?.comments && data.plan.comments.length > 0 && (
              <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100 mt-2">
                <h3 className="text-sm font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 text-xs font-black">!</span>
                  관리자 코멘트 이력
                </h3>
                <div className="space-y-4">
                  {data.plan.comments.map((cmt, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="bg-white border border-orange-100 rounded-xl p-3 flex-1 shadow-sm">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{cmt.content}</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          {cmt.createdAt ? new Date(cmt.createdAt).toLocaleString() : '최근'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usages Plan Table */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-yonsei-blue" />
              세부 사용 계획
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-500">일자</th>
                  <th className="px-4 py-3 font-bold text-gray-500">분류</th>
                  <th className="px-4 py-3 font-bold text-gray-500">사용처</th>
                  <th className="px-4 py-3 font-bold text-gray-500 w-32 text-right">금액 (원)</th>
                  <th className="px-4 py-3 font-bold text-gray-500">단계/상태</th>
                  {(data.plan?.status === 'approved' || role === 'super') && <th className="px-4 py-3 font-bold text-gray-500 text-center">관리</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(!data.usages || data.usages.length === 0) ? (
                  <tr>
                    <td colSpan={(data.plan?.status === 'approved' || role === 'super') ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                      등록된 사용 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.usages.map((usage) => {
                    const canDelete = usage.step === 'tentative' || role === 'super';

                    return (
                      <tr 
                        key={usage.id} 
                        onClick={() => router.push(`/wave/team/usage/${usage.id}`)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-gray-900">{usage.date ? new Date(usage.date).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-4 text-gray-600">{usage.type}</td>
                        <td className="px-4 py-4 text-gray-600">{usage.for}</td>
                        <td className="px-4 py-4 text-gray-900 font-bold text-right tabular-nums w-32">{usage.cost?.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-bold text-gray-400">{getStepLabel(usage.step)}</span>
                            {getStatusBadge(usage.status)}
                          </div>
                        </td>
                        {(data.plan?.status === 'approved' || role === 'super') && (
                          <td className="px-4 py-4 text-center">
                            <button
                              disabled={!canDelete}
                              onClick={(e) => handleDelete(e, usage.id)}
                              className={`p-2 rounded-lg transition-colors ${canDelete ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed opacity-50'}`}
                              title={canDelete ? "삭제" : "삭제 불가 (진행중이거나 기한 지남)"}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
                {(data.plan?.status === 'approved' || role === 'super') && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => router.push('/wave/team/usage/new')}
                        className="w-full flex items-center justify-center gap-2 py-4 text-gray-500 hover:text-yonsei-blue hover:bg-blue-50 transition-all font-bold text-sm"
                      >
                        <PlusCircle className="w-5 h-5" />
                        새로운 내역 추가
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}

export default function WaveTeamDashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" /></div>}>
      <WaveTeamDashboardContent />
    </Suspense>
  );
}

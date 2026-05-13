'use client';

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getTeamByUserIdWithPlan, getTeamWithPlanById } from "@/api/get";
import { TeamWithPlan, Usage } from "@/interface/interface";
import { Loader2, Users, FileText, PlusCircle, Trash2, Download, Upload, CheckCircle, XCircle, ChevronUp, ChevronDown, ChevronsUpDown, Edit, X } from "lucide-react";
import { deleteUsage } from "@/api/delete";
import { putPlan, putTeam } from "@/api/put";
import { postComment } from "@/api/post";
import { getImage } from "@/utils/imageUtils";

const usageTypeMap: Record<string, string> = {
  supplies: "사무용품",
  promotion: "인쇄물 및 홍보물",
  meetings: "회의비",
  registration: "참가비",
  materials: "재료비",
  outsourcing: "용역비"
};

function WaveTeamDashboardContent() {
  const { role, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTeamId = searchParams.get('teamId');

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TeamWithPlan | null>(null);

  // 정렬용 State
  type SortField = 'date' | 'type' | 'cost' | 'status';
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');

  // 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<string>("");
  const [editDescribe, setEditDescribe] = useState("");
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEditModal = () => {
    if (!data) return;
    setEditName(data.name || "");
    setEditType(data.type || "");
    setEditDescribe(data.describe || "");
    setEditBalance(data.balance || 0);
    setEditImage(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("type", editType);
    formData.append("describe", editDescribe);
    formData.append("balance", editBalance.toString());
    if (editImage) {
      formData.append("img", editImage);
    }
    
    const teamId = data.id || (data as any)._id;
    const res = await putTeam(teamId, formData);
    
    if (res.success) {
      alert("팀 정보가 수정되었습니다.");
      window.location.reload();
    } else {
      alert(res.message || "수정 실패");
    }
    setIsSaving(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4 inline-block ml-1 text-gray-300" />;
    if (sortDirection === 'asc') return <ChevronUp className="w-4 h-4 inline-block ml-1 text-yonsei-blue" />;
    return <ChevronDown className="w-4 h-4 inline-block ml-1 text-yonsei-blue" />;
  };

  const sortedUsages = React.useMemo(() => {
    if (!data?.usages) return [];
    let filtered = [...data.usages];
    if (filterType !== 'all') {
      filtered = filtered.filter(u => u.type === filterType);
    }
    return filtered.sort((a, b) => {
      let compareA: any = a[sortField];
      let compareB: any = b[sortField];
      
      if (sortField === 'cost') {
        compareA = Number(a.cost) || 0;
        compareB = Number(b.cost) || 0;
      } else if (sortField === 'date') {
        compareA = a.date ? new Date(a.date).getTime() : 0;
        compareB = b.date ? new Date(b.date).getTime() : 0;
      } else {
        compareA = compareA ? String(compareA).toLowerCase() : '';
        compareB = compareB ? String(compareB).toLowerCase() : '';
      }
    
      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data?.usages, sortField, sortDirection]);

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

  const calculateTotalUsage = (usages: Usage[]) => {
    return usages
      .filter((u) => u.step === "finalization" && u.status === "approved")
      .reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
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

  return (
    <ProtectedRoute minRole="wave">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Team Info Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 relative">
            {role === 'super' && (
              <button
                onClick={handleOpenEditModal}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-yonsei-blue hover:bg-blue-50 rounded-lg transition-colors"
                title="팀 정보 편집"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-start gap-4 mb-6 pr-10">
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
                  <th className="px-4 py-3 font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('date')}>
                    일자 {renderSortIcon('date')}
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-500">
                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-transparent font-bold cursor-pointer outline-none focus:ring-0 appearance-none text-gray-500 hover:text-gray-700"
                    >
                      <option value="all">분류 (전체)</option>
                      {Object.entries(usageTypeMap).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-500">사용처</th>
                  <th className="px-4 py-3 font-bold text-gray-500 w-32 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('cost')}>
                    금액 (원) {renderSortIcon('cost')}
                  </th>
                  <th className="px-4 py-3 font-bold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={() => handleSort('status')}>
                    단계/상태 {renderSortIcon('status')}
                  </th>
                  {role === 'super' && <th className="px-4 py-3 font-bold text-gray-500 text-center">관리</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(!sortedUsages || sortedUsages.length === 0) ? (
                  <tr>
                    <td colSpan={role === 'super' ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                      등록된 사용 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sortedUsages.map((usage) => {
                    const canDelete = role === 'super';

                    return (
                      <tr 
                        key={usage.id} 
                        onClick={() => router.push(`/wave/team/usage/${usage.id}`)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 font-medium text-gray-900">{usage.date ? new Date(usage.date).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-4 text-gray-600">{usageTypeMap[usage.type] || usage.type}</td>
                        <td className="px-4 py-4 text-gray-600">{usage.for}</td>
                        <td className="px-4 py-4 text-gray-900 font-bold text-right tabular-nums w-32">{usage.cost?.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          {getCombinedBadge(usage.step, usage.status)}
                        </td>
                        {role === 'super' && (
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={(e) => handleDelete(e, usage.id)}
                              className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50"
                              title="삭제"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
                <tr>
                  <td colSpan={role === 'super' ? 6 : 5} className="bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => router.push('/wave/team/usage/new')}
                      className="w-full flex items-center justify-center gap-2 py-4 text-gray-500 hover:text-yonsei-blue hover:bg-blue-50 transition-all font-bold text-sm cursor-pointer"
                    >
                        <PlusCircle className="w-5 h-5" />
                        새로운 내역 추가
                      </button>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-900">팀 정보 편집</h2>
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">팀 이름</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yonsei-blue outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">분류 (Type)</label>
                <select 
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yonsei-blue outline-none"
                  required
                >
                  <option value="" disabled>분류 선택</option>
                  <option value="innovative">혁신형 (innovative)</option>
                  <option value="lab">실험실 (lab)</option>
                  <option value="local">지역형 (local)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">팀 소개</label>
                <textarea 
                  value={editDescribe}
                  onChange={e => setEditDescribe(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yonsei-blue outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">자본금 (Balance)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={editBalance}
                    onChange={e => setEditBalance(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-yonsei-blue outline-none"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">원</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">대표 이미지 변경</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setEditImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-yonsei-blue rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

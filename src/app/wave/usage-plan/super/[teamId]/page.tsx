"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UsagePlanTable from "@/components/wave/UsagePlanTable";
import { UsagePlan, PlanStatusType } from "@/interface/interface";
import { fetchUsagePlan, updateUsagePlanStatus } from "@/utils/mockUsagePlan";
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";

export default function SuperUsagePlanDetail() {
  const { teamId } = useParams() as { teamId: string };
  const router = useRouter();

  const [data, setData] = useState<UsagePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const mockData = await fetchUsagePlan(teamId);
      if (mockData) {
        setData(mockData);
        setComment(mockData.comment || "");
      }
      setIsLoading(false);
    };
    loadData();
  }, [teamId]);

  const handleUpdateStatus = async (newStatus: PlanStatusType) => {
    if (!data) return;
    setIsUpdating(true);
    const success = await updateUsagePlanStatus(teamId, newStatus, comment);
    setIsUpdating(false);

    if (success) {
      setData({ ...data, status: newStatus, comment });
      alert(`${newStatus} 처리되었습니다.`);
    } else {
      alert("업데이트에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute minRole="super">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute minRole="super">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-gray-500">
          데이터를 찾을 수 없습니다.
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute minRole="super">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => router.push("/wave/usage-plan/super")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-yonsei-blue mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 대시보드로 돌아가기
        </button>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 relative mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">{data.teamName} <span className="text-lg text-gray-500 font-medium">({data.teamId})</span></h1>
              <p className="text-sm text-gray-500 mt-1">제출일: {data.submittedAt}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${data.status === '승인' ? 'bg-green-100 text-green-700 border-green-200' : data.status === '반려' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
              상태: {data.status}
            </div>
          </div>

          <UsagePlanTable
            items={data.items}
            canEdit={false} // 관리자는 읽기만 가능
            balance={data.balance}
          />
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">심사 피드백 및 상태 변경</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yonsei-blue focus:border-yonsei-blue resize-none mb-6 text-sm text-gray-700"
            placeholder="팀에 전달할 피드백이나 검토 의견을 작성해주세요."
          />

          <div className="flex flex-wrap gap-4 justify-end">
            <button
              onClick={() => handleUpdateStatus("처리대기")}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Clock className="w-4 h-4" /> 보류 (대기)
            </button>
            <button
              onClick={() => handleUpdateStatus("반려")}
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> 반려
            </button>
            <button
              onClick={() => handleUpdateStatus("승인")}
              disabled={isUpdating}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold bg-yonsei-blue text-white shadow-md hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> 최종 승인
            </button>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}

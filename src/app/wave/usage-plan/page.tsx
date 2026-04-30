"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UsagePlanTable from "@/components/wave/UsagePlanTable";
import { UsagePlan, IUsagePlanItem } from "@/interface/interface";
import { fetchUsagePlan, saveUsagePlan } from "@/utils/mockUsagePlan";
import { Save, Loader2, CheckCircle2 } from "lucide-react";

export default function WaveUsagePlanPage() {
  const { role, userId } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<UsagePlan | null>(null);
  const [items, setItems] = useState<IUsagePlanItem[]>([]);
  const [hasError, setHasError] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // super 관리자인 경우 대시보드로 리다이렉트
    if (role === "super") {
      router.replace("/wave/usage-plan/super");
      return;
    }

    // 데이터 조회
    const loadData = async () => {
      setIsLoading(true);
      // 실제 환경에서는 userId에 매핑된 teamId 값을 백엔드에서 줍니다.
      // 시연용으로는 특정 teamId를 강제 지정하거나 userId가 team-b 일경우 다르게 줄 수 있습니다.
      const teamId = userId === "wave_team_b" ? "team-b" : "team-a"; 
      const mockData = await fetchUsagePlan(teamId);
      
      if (mockData) {
        setData(mockData);
        setItems(mockData.items);
      }
      setIsLoading(false);
    };

    if (role === "wave") {
      loadData();
    }
  }, [role, router, userId]);

  const handleSave = async () => {
    if (!data) return;
    if (hasError) return;

    setIsSaving(true);
    const success = await saveUsagePlan(data.teamId, items);
    setIsSaving(false);

    if (success) {
      setToastMessage("저장되었습니다.");
      setTimeout(() => setToastMessage(""), 3000);
      setData((prev) => prev ? { ...prev, items: items as any, status: "처리대기" } : prev);
    } else {
      alert("저장에 실패했습니다.");
    }
  };

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
          데이터를 불러올 수 없습니다.
        </div>
      </ProtectedRoute>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "승인": return "bg-green-100 text-green-700 border-green-200";
      case "반려": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <ProtectedRoute minRole="wave">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-lg animate-in slide-in-from-top-4 fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">사용계획서 관리</h1>
            <p className="text-gray-500 mt-2">나의 WAVE 팀 예산을 계획하고 제출하세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(data.status)}`}>
              현재 상태: {data.status}
            </div>
          </div>
        </div>

        {data.comment && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yonsei-blue" />
            <h4 className="font-bold text-yonsei-blue mb-1">관리자 피드백</h4>
            <p className="text-gray-700 text-sm">{data.comment}</p>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <UsagePlanTable
            items={items}
            canEdit={data.canEdit}
            balance={data.balance}
            onChangeItems={setItems}
            onHasError={setHasError}
          />
        </div>

        {data.canEdit && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || hasError}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all ${
                isSaving || hasError 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-yonsei-blue hover:bg-blue-800 hover:shadow-lg"
              }`}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "저장 중..." : "저장 및 제출하기"}
            </button>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}

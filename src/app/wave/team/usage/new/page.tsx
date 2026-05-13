'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getTeamByUserIdWithPlan } from "@/api/get";
import { postUsage } from "@/api/post";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import { UsageType, UsageTypeKo, TeamType, Usage } from "@/interface/interface";
import { validateUsageBudget, getMaxLimitText } from "@/utils/validation";

const usageTypeMap: Record<UsageType, UsageTypeKo> = {
  supplies: "사무용품",
  promotion: "인쇄물 및 홍보물",
  meetings: "회의비",
  registration: "참가비",
  materials: "재료비",
  outsourcing: "용역비"
};

export default function WaveTeamUsageNewPage() {
  const { role, userId } = useAuth();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [date, setDate] = useState("");
  const [type, setType] = useState<UsageType | "">("");
  const [useFor, setUseFor] = useState("");
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);

  const [errorPrompt, setErrorPrompt] = useState("");

  const [teamId, setTeamId] = useState("");
  const [planId, setPlanId] = useState("");
  const [teamBalance, setTeamBalance] = useState(0);
  const [teamType, setTeamType] = useState<TeamType | undefined>(undefined);
  const [usages, setUsages] = useState<Usage[]>([]);

  React.useEffect(() => {
    const loadTeam = async () => {
      if (userId) {
        const teamData = await getTeamByUserIdWithPlan(userId);
        if (teamData) {
          setTeamId(teamData.id);
          setTeamBalance(teamData.balance || 0);
          if (teamData.plan) setPlanId(teamData.plan.id);
          setTeamType(teamData.type);
          setUsages(teamData.usages || []);
        }
      }
    };
    if (role === "wave" || role === "super") {
      loadTeam();
    }
  }, [userId, role]);

  const currentAccumulatedCost = React.useMemo(() => {
    if (!type) return 0;
    return usages
      .filter((u) => u.type === type)
      .reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  }, [usages, type]);

  const limitText = React.useMemo(() => {
    if (!type) return "";
    return getMaxLimitText(type as UsageType, teamType, teamBalance, currentAccumulatedCost);
  }, [type, teamType, teamBalance, currentAccumulatedCost]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      setErrorPrompt("분류를 선택해주세요.");
      return;
    }

    setIsSaving(true);
    setErrorPrompt("");

    const accumulatedCost = usages
      .filter((u) => u.type === type)
      .reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);

    const validation = validateUsageBudget(
      type as UsageType,
      cost,
      teamType,
      teamBalance,
      accumulatedCost
    );

    if (!validation.isValid) {
      setErrorPrompt(validation.message);
      setIsSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append("teamId", teamId);
    formData.append("planId", planId);
    formData.append("date", date);
    formData.append("type", type);
    formData.append("for", useFor);
    formData.append("cost", String(cost));
    formData.append("note", note);
    formData.append("status", 'pending');
    formData.append("step", 'request');
    if (beforeFile) {
      formData.append("beforeFile", beforeFile);
    }

    const res = await postUsage(formData);
    setIsSaving(false);

    if (res.success) {
      alert("사용 내역이 성공적으로 등록되었습니다.");
      router.push("/wave/team");
    } else {
      setErrorPrompt(res.message);
    }
  };

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
          <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">새 사용 내역 등록</h1>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">사용 일자</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">분류 (Type)</label>
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value as UsageType)}
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none bg-white text-gray-700"
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
                  placeholder="구체적인 사용 내역을 적어주세요."
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none"
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
                    className="w-full border border-gray-200 py-3 px-4 pr-10 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none text-right font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">원</span>
                </div>
                {limitText && (
                  <p className="mt-2 text-xs font-bold text-gray-400">{limitText}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-gray-700 mb-2">증빙 자료 업로드 (신청 시)</label>
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
                    <p className="text-xs text-gray-400 font-medium">PNG, JPG, PDF (최대 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-gray-700 mb-2">비고 (Note)</label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="추가적인 참고사항이나 증빙 내역을 적어주세요."
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none resize-y"
                />
              </div>
            </div>

            {errorPrompt && (
              <div className="text-red-500 bg-red-50 p-4 rounded-xl font-bold border border-red-100 mt-4">
                {errorPrompt}
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4 mt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "요청 중..." : "요청하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

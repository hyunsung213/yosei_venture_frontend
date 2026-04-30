'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getTeamByUserIdWithPlan } from "@/api/get";
import { postUsage } from "@/api/post";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function WaveTeamUsageNewPage() {
  const { role, userId } = useAuth();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [useFor, setUseFor] = useState("");
  const [cost, setCost] = useState(0);
  const [note, setNote] = useState("");

  const [errorPrompt, setErrorPrompt] = useState("");

  const [teamId, setTeamId] = useState("");
  const [planId, setPlanId] = useState("");
  const [teamBalance, setTeamBalance] = useState(0);

  React.useEffect(() => {
    const loadTeam = async () => {
      if (userId) {
        const teamData = await getTeamByUserIdWithPlan(userId);
        if (teamData) {
          setTeamId(teamData.id);
          setTeamBalance(teamData.balance || 0);
          if (teamData.plan) setPlanId(teamData.plan.id);
        }
      }
    };
    if (role === "wave" || role === "super") {
      loadTeam();
    }
  }, [userId, role]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorPrompt("");

    const newData = {
      teamId,
      planId,
      date,
      type,
      for: useFor,
      cost,
      note,
      status: 'pending',
      step: 'tentative'
    };

    const res = await postUsage(newData);
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
                <input
                  type="text"
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="예: 회의비, 도서구입비"
                  className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none"
                />
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
                {isSaving ? "등록 중..." : "새 내역 추가"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

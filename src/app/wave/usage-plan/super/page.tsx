"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UsagePlanSimple } from "@/interface/interface";
import { fetchAllUsagePlanSummaries } from "@/utils/mockUsagePlan";
import { Loader2, ChevronRight } from "lucide-react";

export default function SuperUsagePlanDashboard() {
  const [summaries, setSummaries] = useState<UsagePlanSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchAllUsagePlanSummaries();
      setSummaries(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute minRole="super">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
        </div>
      </ProtectedRoute>
    );
  }

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "승인": return "bg-green-100 text-green-700";
      case "반려": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <ProtectedRoute minRole="super">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Wave 팀 계획서 모니터링</h1>
          <p className="text-gray-500 mt-2">전체 팀의 사용계획서 제출 현황을 확인하고 심사합니다.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">팀명 (ID)</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">제출 일자</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">총 계획 금액</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">상태</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">상세</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                    제출된 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                summaries.map((summary) => (
                  <tr key={summary.teamId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{summary.teamName}</div>
                      <div className="text-xs text-gray-400">{summary.teamId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {summary.submittedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold flex-col align-middle text-right text-gray-700">
                      {summary.totalAmount.toLocaleString()} 원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getBadgeStyle(summary.status)}`}>
                        {summary.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link 
                        href={`/wave/usage-plan/super/${summary.teamId}`}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-yonsei-blue hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}

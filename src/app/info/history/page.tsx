'use client';

import { CheckCircle2 } from "lucide-react";

export interface HistoryRecord {
  year: string;
  milestones: string[];
}

const dummyHistory: HistoryRecord[] = [
  { year: "2026", milestones: ["연세대학교 창업지원단 우수 창업 허브 선정", "글로벌 창업 지원 프로그램 신설"] },
  { year: "2025", milestones: ["제2창업보육센터 완공", "지역 연계 창업 생태계 활성화 MOU 체결"] },
  { year: "2024", milestones: ["학생 창업팀 50개 육성 돌파", "창업 지원 펀드 100억 조성"] },
  { year: "2023", milestones: ["연세 메이커스페이스 개소", "혁신 창업 아이디어 경진대회 개최"] },
  { year: "2022", milestones: ["창업지원단 확대 개편", "지역 맞춤형 특화 창업 프로그램 도입"] },
  { year: "2021", milestones: ["연세대학교 미래캠퍼스 창업지원단 출범", "초대 창업지원단장 취임"] }
];

export default function HistoryPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14 mb-8">
      <div className="relative w-full max-w-4xl mx-auto py-4">
        {/* Center vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>
        
        <div className="space-y-6">
          {dummyHistory.map((record, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="relative flex items-start justify-between w-full">
                
                {/* Left Side */}
                <div className={`w-5/12 text-right pr-8 ${!isEven ? 'invisible' : ''}`}>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight leading-none">
                    {record.year}
                  </h3>
                  <div className="space-y-2 flex flex-col items-end">
                    {record.milestones.map((ms, j) => (
                      <div key={j} className="flex gap-3 items-start justify-end group">
                        <p className="text-lg text-gray-600 font-medium leading-relaxed break-keep group-hover:text-gray-900 transition-colors text-right">
                          {ms}
                        </p>
                        <CheckCircle2 className="w-5 h-5 text-gray-300 mt-0.5 group-hover:text-yonsei-blue transition-colors flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yonsei-blue rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* Right Side */}
                <div className={`w-5/12 text-left pl-8 ${isEven ? 'invisible' : ''}`}>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight leading-none">
                    {record.year}
                  </h3>
                  <div className="space-y-2">
                    {record.milestones.map((ms, j) => (
                      <div key={j} className="flex gap-3 items-start group">
                        <CheckCircle2 className="w-5 h-5 text-gray-300 mt-0.5 group-hover:text-yonsei-blue transition-colors flex-shrink-0" />
                        <p className="text-lg text-gray-600 font-medium leading-relaxed break-keep group-hover:text-gray-900 transition-colors">
                          {ms}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

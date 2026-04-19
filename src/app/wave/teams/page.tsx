'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Team, TeamType } from '@/interface/interface';
import { getAllTeams } from '@/api/get';
import { Loader2, Users, Building, ExternalLink } from 'lucide-react';
import { getImage } from '@/utils/imageUtils';

const typeLabels: Record<TeamType, string> = {
  innovative: "혁신창업",
  lab1th: "LAB 1th",
  lab2th: "LAB 2th",
  local1th: "LOCAL 일반",
  local2th: "LOCAL 창업체험형",
};

const MAIN_CATEGORIES = [
  { id: 'INNOVATION', label: 'INNOVATION', types: ['innovative'] },
  { id: 'LAB', label: 'LAB', types: ['lab1th', 'lab2th'] },
  { id: 'LOCAL', label: 'LOCAL', types: ['local1th', 'local2th'] },
] as const;

type CategoryId = typeof MAIN_CATEGORIES[number]['id'];

export default function WaveTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('LAB');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAllTeams();
        setTeams(data ?? []);
      } catch (error) {
        console.error("팀 데이터를 불러오는 데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 현재 카테고리에 속한 타입들 추출
  const currentTypes = (MAIN_CATEGORIES.find(c => c.id === activeCategory)?.types as unknown as TeamType[]) || [];

  // 필터링 및 그룹화 데이터 생성
  const filteredTeams = teams.filter(team => currentTypes.includes(team.type as TeamType));
  const groupedTeams = filteredTeams.reduce((acc, team) => {
    const type = team.type || 'innovative';
    if (!acc[type]) acc[type] = [];
    acc[type].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold underline-offset-4">참여 팀 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* 탭 네비게이션 */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1.5 bg-gray-100/50 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-inner">
          {MAIN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                px-8 py-3 rounded-xl text-sm font-black transition-all duration-300
                ${activeCategory === cat.id 
                  ? 'bg-white text-yonsei-blue shadow-lg ring-1 ring-black/5 scale-105' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 팀 리스트 렌더링 */}
      <div className="space-y-20 min-h-[400px]">
        {filteredTeams.length > 0 ? (
          currentTypes.map((type, groupIdx) => {
            const teamList = groupedTeams[type];
            if (!teamList || teamList.length === 0) return null;

            return (
              <section key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* 카테고리 헤더 - 상세 라벨 표시 (LAB 1th 등) */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-8 w-1.5 bg-yonsei-blue rounded-full"></div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {typeLabels[type]}
                    <span className="ml-3 text-yonsei-blue text-lg opacity-60 font-serif italic">
                      {teamList.length < 10 ? `0${teamList.length}` : teamList.length}
                    </span>
                  </h2>
                </div>

                {/* 팀 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                  {teamList.map((team, tIdx) => (
                    <div 
                      key={team.id} 
                      className="group flex flex-col sm:flex-row bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2"
                    >
                      {/* 이미지 섹션 */}
                      <div className="relative w-full sm:w-[42%] h-56 sm:h-auto overflow-hidden bg-gray-50 flex-shrink-0">
                        {team.img ? (
                          <Image
                            src={getImage(team.img)}
                            alt={team.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            unoptimized
                            priority={groupIdx === 0 && tIdx < 2}
                            loading={groupIdx === 0 && tIdx < 2 ? "eager" : "lazy"}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 gap-3">
                             <Building className="w-12 h-12 opacity-50" />
                             <span className="text-[10px] uppercase font-black tracking-tighter opacity-70">IMAGE NOT READY</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-yonsei-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      
                      {/* 정보 섹션 */}
                      <div className="w-full sm:w-[58%] p-8 md:p-10 flex flex-col justify-center bg-white md:min-h-[240px]">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-black text-yonsei-blue bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-blue-100/50">
                              {typeLabels[type]}
                            </span>
                          </div>
                          <h4 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-yonsei-blue transition-colors leading-tight">
                            {team.name}
                          </h4>
                          <p className="text-gray-500 text-sm font-medium leading-[1.7] line-clamp-4">
                            {team.describe || "팀에 대한 간략한 설명이 아직 준비되지 않았습니다. 연세대학교 창업지원단이 응원합니다."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-24 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2">
              <Users className="w-8 h-8 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">No Teams Found</h3>
            <p className="text-gray-400 text-sm font-medium max-w-[300px]">해당 카테고리에 등록된 팀이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

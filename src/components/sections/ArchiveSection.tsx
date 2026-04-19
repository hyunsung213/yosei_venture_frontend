'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Globe, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllTeams, getAllNotices } from "@/api/get";
import { Team, Notice } from "@/interface/interface";
import { getImage } from "@/utils/imageUtils";

const typeLabels: Record<string, string> = {
  innovative: "혁신창업",
  lab1th: "LAB 1th",
  lab2th: "LAB 2th",
  local1th: "LOCAL 일반",
  local2th: "LOCAL 창업체험형",
};

export default function ArchiveSection() {
  const [activeTab, setActiveTab] = useState<'wave' | 'community'>('wave');
  const [teams, setTeams] = useState<Team[]>([]);
  const [waveNotices, setWaveNotices] = useState<Notice[]>([]);
  const [communityNotices, setCommunityNotices] = useState<Notice[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  const nextTeam = useCallback(() => {
    if (teams.length === 0) return;
    setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
  }, [teams.length]);

  const prevTeam = useCallback(() => {
    if (teams.length === 0) return;
    setCurrentTeamIndex((prev) => (prev - 1 + teams.length) % teams.length);
  }, [teams.length]);

  useEffect(() => {
    async function fetchData() {
      const allTeams = await getAllTeams();
      if (allTeams) setTeams(allTeams);

      const allNotices = await getAllNotices();
      if (allNotices) {
        setWaveNotices(allNotices.filter((n: any) => n.isWave));
        setCommunityNotices(allNotices.filter((n: any) => !n.isWave));
      }
    }
    fetchData();
  }, []);

  // 2s Auto-play timer
  useEffect(() => {
    if (teams.length <= 1) return;
    const timer = setInterval(() => {
      nextTeam();
    }, 2000);
    return () => clearInterval(timer);
  }, [teams.length, nextTeam]);

  const currentNotices = activeTab === 'wave' ? waveNotices : communityNotices;

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <section id="community" className="py-20 bg-gray-50 border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left: Team Intro Carousel */}
          <div className="flex flex-col h-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                창업 팀 <span className="text-yonsei-blue">소개</span>
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={prevTeam}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={nextTeam}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-[2rem]">
              <div className="absolute inset-0 flex items-center">
                <motion.div 
                  className="flex w-full h-full p-0"
                  style={{ gap: '5%' }}
                  animate={{ x: `${15 - currentTeamIndex * (70 + 5)}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  {teams.length > 0 ? (
                    teams.map((team, idx) => (
                      <div 
                        key={team.id}
                        className={`relative flex-shrink-0 w-[70%] h-[90%] my-auto rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100 transition-all duration-500 ${idx === currentTeamIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-40'}`}
                      >
                        <div className="h-[55%] w-full relative">
                          <img 
                            src={getImage(team.img) || ""} 
                            alt={team.name} 
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-4 left-4 bg-yonsei-blue/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">
                            {typeLabels[team.type] || team.type}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col justify-center flex-1">
                          <h4 className="text-xl font-black text-gray-900 mb-2 truncate">{team.name}</h4>
                          <p className="text-gray-500 font-medium line-clamp-2 break-keep text-sm leading-relaxed">
                            {team.describe || "팀에 대한 상세 설명이 아직 등록되지 않았습니다."}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-300 gap-3">
                      <Globe className="w-10 h-10 opacity-20 animate-pulse" />
                      <p className="font-black uppercase tracking-widest text-xs">No Teams Registered</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right: Tabbed Notices */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-200 flex flex-col h-[480px]">
            <div className="mb-8">
              <div className="flex gap-8 border-b border-gray-50 w-full">
                <button 
                  onClick={() => setActiveTab('wave')}
                  className={`pb-4 font-black text-lg transition-all relative whitespace-nowrap tracking-tight ${activeTab === 'wave' ? 'text-yonsei-blue' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  Wave 공지사항
                  {activeTab === 'wave' && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-[-1px] left-0 right-0 h-1 bg-yonsei-blue rounded-full" 
                    />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('community')}
                  className={`pb-4 font-black text-lg transition-all relative whitespace-nowrap tracking-tight ${activeTab === 'community' ? 'text-yonsei-blue' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  커뮤니티 공지사항
                  {activeTab === 'community' && (
                    <motion.div 
                      layoutId="activeTabUnderline"
                      className="absolute bottom-[-1px] left-0 right-0 h-1 bg-yonsei-blue rounded-full" 
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                {currentNotices.length > 0 ? (
                  currentNotices.map((notice, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={notice.id} 
                      className="py-4 border-b border-gray-50 last:border-0 group cursor-pointer flex justify-between items-center hover:bg-gray-50/80 px-3 -mx-2 rounded-xl transition-all"
                    >
                      <p className="text-gray-800 font-bold group-hover:text-yonsei-blue transition-colors line-clamp-1 pr-4 text-sm tracking-tight">
                        {notice.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 font-black tracking-tighter bg-gray-50 px-2 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-yonsei-blue transition-colors">
                        {formatDate(notice.createdAt)}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                     <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                        <ChevronRight className="w-6 h-6 text-gray-200 rotate-90" />
                     </div>
                     <p className="text-gray-300 font-black uppercase tracking-widest text-[9px]">Empty Notice</p>
                  </div>
                )}
              </div>
            </div>

            <Link 
              href={activeTab === 'wave' ? '/wave/notice' : '/community/notice'}
              className="w-full mt-8 py-4 bg-gray-50 text-gray-500 font-black rounded-xl hover:bg-yonsei-blue hover:text-white transition-all border border-transparent flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95"
            >
              View All Notices <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

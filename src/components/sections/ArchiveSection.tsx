'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Notice } from "@/interface/interface";
import { getImage } from "@/utils/imageUtils";
import { getAllPrograms, getCommunityNotices, getWaveNotices } from "@/api/get";
import Image from "next/image";

export default function ArchiveSection() {
  const [activeTab, setActiveTab] = useState<'wave' | 'community'>('wave');
  const [programs, setPrograms] = useState<any[]>([]);
  const [waveNotices, setWaveNotices] = useState<Notice[]>([]);
  const [communityNotices, setCommunityNotices] = useState<Notice[]>([]);
  const [currentProgramIndex, setCurrentProgramIndex] = useState(0);

  const nextProgram = useCallback(() => {
    if (programs.length === 0) return;
    setCurrentProgramIndex((prev) => (prev + 1) % programs.length);
  }, [programs.length]);

  const prevProgram = useCallback(() => {
    if (programs.length === 0) return;
    setCurrentProgramIndex((prev) => (prev - 1 + programs.length) % programs.length);
  }, [programs.length]);

  useEffect(() => {
    async function fetchData() {
      // Fetch programs
      try {
        const result = await getAllPrograms(1, 20);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rawData: any[] = result?.items ?? result ?? [];
        const processed = rawData.map((item: any) => {
          const endDate = new Date(item.endDate ?? item.end_date);
          endDate.setHours(23, 59, 59, 999);
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            ...item,
            diffDays,
            dDayStr: diffDays === 0 ? "D-Day" : `D-${diffDays}`,
          };
        }).filter((item: any) => item.diffDays >= 0);
        processed.sort((a, b) => a.diffDays - b.diffDays);
        setPrograms(processed);
      } catch {
        setPrograms([]);
      }

      // Fetch notices
      const wn = await getWaveNotices();
      if (wn) setWaveNotices(Array.isArray(wn) ? wn : (wn as any).items ?? []);

      const cn = await getCommunityNotices();
      if (cn) setCommunityNotices(Array.isArray(cn) ? cn : (cn as any).items ?? []);
    }
    fetchData();
  }, []);

  // Auto-play timer for programs
  useEffect(() => {
    if (programs.length <= 1) return;
    const timer = setInterval(() => {
      nextProgram();
    }, 3000);
    return () => clearInterval(timer);
  }, [programs.length, nextProgram]);

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
          
          {/* Left: Program Carousel */}
          <div className="flex flex-col h-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                진행중인 <span className="text-yonsei-blue">프로그램</span>
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={prevProgram}
                  className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={nextProgram}
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
                  animate={{ x: `${15 - currentProgramIndex * (70 + 5)}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  {programs.length > 0 ? (
                    programs.map((program, idx) => (
                      <div 
                        key={program.id ?? idx}
                        className={`relative flex-shrink-0 w-[70%] h-[90%] my-auto rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100 transition-all duration-500 ${idx === currentProgramIndex ? 'scale-100 opacity-100' : 'scale-95 opacity-40'}`}
                      >
                        {/* Poster image */}
                        <div className="h-[55%] w-full relative bg-gray-100">
                          <Image
                            src={getImage(program.poster_url ?? program.poster ?? program.image ?? "")}
                            alt={program.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {/* D-Day badge */}
                          <div className="absolute top-4 left-4 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded shadow-md border border-red-700/50">
                            {program.dDayStr}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col justify-between flex-1">
                          <h4 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 break-keep">{program.title}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-auto">
                            <Calendar className="w-3.5 h-3.5 text-yonsei-blue flex-shrink-0" />
                            <span className="truncate">
                              {(program.startDate ?? program.start_date ?? '').slice(5)} ~ {(program.endDate ?? program.end_date ?? '').slice(5)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-300 gap-3">
                      <Calendar className="w-10 h-10 opacity-20 animate-pulse" />
                      <p className="font-black uppercase tracking-widest text-xs">No Programs</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Dot indicators */}
            {programs.length > 0 && (
              <div className="flex justify-center items-center mt-4 gap-1.5">
                {programs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentProgramIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${idx === currentProgramIndex ? 'w-6 h-2 bg-yonsei-blue' : 'w-2 h-2 bg-gray-300'}`}
                  />
                ))}
              </div>
            )}
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

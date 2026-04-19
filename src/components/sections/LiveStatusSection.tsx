'use client';

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getAllPrograms } from "@/api/get";
import { ProgramForSuper } from "@/interface/interface";
import { motion, useAnimationControls } from "framer-motion";
import { getImage } from "@/utils/imageUtils";

export default function LiveStatusSection() {
  const [activePrograms, setActivePrograms] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimationControls();

  const itemsPerView = 3;
  const slideStep = 3;

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let rawData: any[] = [];
      try {
        const result = await getAllPrograms();
        if (result && result.length > 0) {
          rawData = result;
        }
      } catch {
        // silently fall back — no dummy data for landing
      }

      const processed = rawData.map((item: any) => {
        const endDate = new Date(item.end_date);
        endDate.setHours(23, 59, 59, 999);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...item,
          diffDays,
          dDayStr: diffDays === 0 ? "D-Day" : `D-${diffDays}`,
          tags: item.hash_tag ? [item.hash_tag] : (item.content?.includes("창업") ? ["창업지원", "진행중"] : ["일반", "공진형"]),
          image: item.poster_url ?? item.image ?? "/board_dummy_1.jpg",
        };
      }).filter((item: any) => item.diffDays >= 0);

      processed.sort((a, b) => a.diffDays - b.diffDays);
      setActivePrograms(processed);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activePrograms.length > 0) {
      setCurrentIndex(activePrograms.length); 
    }
  }, [activePrograms.length]);

  useEffect(() => {
    if (activePrograms.length === 0) return;
    controls.start({
      x: `-${currentIndex * (100 / itemsPerView)}%`,
      transition: { duration: 0.7, ease: "easeInOut" }
    });
  }, [currentIndex, activePrograms.length, controls]);

  const advanceSlide = useCallback((direction: 1 | -1) => {
    setCurrentIndex((prev) => prev + (direction * slideStep));
  }, []);

  const handleAnimationComplete = () => {
    if (activePrograms.length === 0) return;

    if (currentIndex >= activePrograms.length * 2) {
      controls.set({ x: `-${(currentIndex - activePrograms.length) * (100 / itemsPerView)}%` });
      setCurrentIndex(currentIndex - activePrograms.length);
    } 
    else if (currentIndex <= 0) {
      controls.set({ x: `-${(currentIndex + activePrograms.length) * (100 / itemsPerView)}%` });
      setCurrentIndex(currentIndex + activePrograms.length);
    }
  };

  useEffect(() => {
    if (activePrograms.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      advanceSlide(1);
    }, 5000);

    return () => clearInterval(interval);
  }, [activePrograms.length, advanceSlide, isHovered]);

  if (activePrograms.length === 0) return null;

  const slidingArray = [...activePrograms, ...activePrograms, ...activePrograms, ...activePrograms];

  return (
    <section 
      id="programs" 
      className="py-24 bg-gray-50 flex justify-center items-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-y-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-keep">
              진행중인 <span className="text-yonsei-blue">모집 공고</span>
            </h2>
            <p className="text-gray-600 text-lg break-keep">
              현재 모집 중인 창업 지원 프로그램과 정부 지원 사업을 확인해보세요.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => advanceSlide(-1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-600 hover:bg-yonsei-blue hover:text-white transition-colors cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => advanceSlide(1)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white text-gray-600 hover:bg-yonsei-blue hover:text-white transition-colors cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button className="text-yonsei-blue font-semibold hover:text-gold transition-colors hidden md:block z-10 cursor-pointer">
              전체 보기 둘러보기 &rarr;
            </button>
          </div>
        </div>

        {/* Carousel Track Wrapper with Strict Overflow */}
        <div className="relative -mx-3 overflow-hidden">
          <motion.div 
            className="flex flex-nowrap"
            animate={controls}
            onAnimationComplete={handleAnimationComplete}
          >
            {slidingArray.map((program, idx) => (
              <div 
                key={`${program.title}-${idx}`} 
                // Set explicitly to 1/3 (3 items per view)
                className="flex-none basis-full md:basis-1/2 lg:basis-1/3 px-3 h-full"
              >
                {/* Horizontal Card: h-[260px] uniformly */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-[0_10px_30px_rgba(0,56,118,0.15)] hover:scale-[1.02] transition-all duration-300 border border-gray-200 flex flex-row h-[260px] overflow-hidden group">
                  
                  {/* Left Column: Visual Area (Increased width to roughly 50% for standard portrait posters) */}
                  <div className="relative w-[48%] h-full bg-gray-100 flex-shrink-0 overflow-hidden border-r border-gray-100">
                    <Image 
                      src={getImage(program.poster_url ?? program.image)}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Floating Bold Red Badge */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded shadow-md border border-red-700/50">
                      {program.dDayStr}
                    </div>
                  </div>

                  {/* Right Column: Information Data Area */}
                  <div className="p-5 flex-grow flex flex-col justify-between w-[52%]">
                    
                    {/* Top Content: Title & Tags */}
                    <div className="flex flex-col gap-2">
                       <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-yonsei-blue transition-colors line-clamp-3 leading-snug break-keep">
                         {program.title}
                       </h3>
                       
                       <div className="flex flex-wrap gap-1.5 mt-1">
                        {program.tags.map((tag: string, tidx: number) => (
                          <span key={tidx} className="bg-gray-50 text-gray-500 text-[11px] font-bold px-2 py-0.5 rounded border border-gray-100">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Lock: Date & CTA */}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        <Calendar className="w-3.5 h-3.5 text-yonsei-blue flex-shrink-0" />
                        <span className="truncate">{program.start_date.slice(5)} ~ {program.end_date.slice(5)}</span>
                      </div>
                      <Link href={`/program/${program.id}`} className="block w-full">
                        <button className="w-full py-2 font-bold text-sm bg-gray-50 text-yonsei-blue rounded-lg group-hover:bg-yonsei-blue group-hover:text-white transition-colors border border-gray-200 group-hover:border-transparent text-center shadow-sm cursor-pointer">
                          자세히 보기
                        </button>
                      </Link>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Horizontal Pagination Indicators */}
        <div className="flex justify-center items-center mt-10 gap-2">
          {[0, 1, 2].map((idx) => {
             // Calculate if this bar should be active based on relative currentIndex
             const logicalPage = Math.floor((currentIndex % activePrograms.length) / itemsPerView);
             const isActive = logicalPage === idx || (idx === 0 && activePrograms.length < itemsPerView);
             
             return (
               <div 
                 key={idx} 
                 className={`h-1.5 rounded-full transition-all duration-300 ${
                   isActive ? "w-10 bg-yonsei-blue" : "w-6 bg-gray-300"
                 }`}
               ></div>
             );
          })}
        </div>
        
      </div>
    </section>
  );
}

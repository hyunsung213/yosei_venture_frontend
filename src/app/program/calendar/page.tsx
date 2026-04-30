'use client';

import React, { useEffect, useState } from 'react';
import { getAllPrograms } from '@/api/get';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ProgramSimple } from '@/interface/interface';

const PASTEL_COLORS = [
  'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
  'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
  'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
];

export default function CalendarPage() {
  const [programs, setPrograms] = useState<ProgramSimple[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      setLoading(true);
      try {
        const data = await getAllPrograms();
        setPrograms(data ?? []);
      } catch (e) {
        console.error("Failed to load generic programs", e);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Create blank days for formatting first week
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  // Create days array
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if a date falls between program start and end
  const getProgramsForDay = (day: number) => {
    const currentCellDate = new Date(year, month, day);
    // Normalize to midnight
    currentCellDate.setHours(0,0,0,0);

    return programs.filter(prog => {
      if (!prog.startDate || !prog.endDate) return false;
      const tStart = new Date(prog.startDate); tStart.setHours(0,0,0,0);
      const tEnd = new Date(prog.endDate); tEnd.setHours(23,59,59,999);
      
      return currentCellDate >= tStart && currentCellDate <= tEnd;
    });
  };

  const isProgramActiveOnDate = (prog: any, y: number, m: number, d: number) => {
      const cellBase = new Date(y, m, d);
      return cellBase >= new Date(new Date(prog.startDate).setHours(0,0,0,0)) && 
             cellBase <= new Date(new Date(prog.endDate).setHours(23,59,59,999));
  }

  return (
    <div className="w-full">
      
      {/* Calendar Header */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            {year}년 {month + 1}월
          </h2>
          <button onClick={handleToday} className="px-3 py-1.5 text-sm font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
            오늘
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition group">
            <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-yonsei-blue" />
          </button>
          <button onClick={handleNextMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition group">
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-yonsei-blue" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
          <p className="font-bold">캘린더 일정을 불러오는 중...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 relative">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
              <div key={idx} className={`p-3 text-center text-sm font-bold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-yonsei-blue' : 'text-gray-500'}`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="min-h-[140px] p-2 border-r border-b border-gray-100 bg-gray-50/50"></div>
            ))}
            
            {days.map(day => {
              const dayPrograms = getProgramsForDay(day);
              // Calculate index to assign colors deterministically
              const dayOfWeek = new Date(year, month, day).getDay();
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              return (
                <div key={`day-${day}`} className={`min-h-[140px] p-2 border-r border-b border-gray-100 transition-colors hover:bg-blue-50/30 overflow-hidden flex flex-col`}>
                  <div className="mb-2">
                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-bold ${
                      isToday ? 'bg-yonsei-blue text-white shadow-md' : 
                      dayOfWeek === 0 ? 'text-red-500' : 
                      dayOfWeek === 6 ? 'text-yonsei-blue' : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden pt-1 w-[calc(100%+16px)] -ml-2">
                    {dayPrograms.map((prog, idx) => {
                      const programId = prog.id || (prog as any).id || `idx-${idx}`;
                      const colorClass = PASTEL_COLORS[(typeof programId === 'string' ? programId.charCodeAt(0) : idx) % PASTEL_COLORS.length];
                      
                      const currentCell = new Date(year, month, day);
                      const tStart = new Date(prog.startDate); tStart.setHours(0,0,0,0);
                      const tEnd = new Date(prog.endDate); tEnd.setHours(23,59,59,999);
                      
                      const isStart = currentCell.toDateString() === tStart.toDateString();
                      const isEnd = currentCell.toDateString() === tEnd.toDateString();
                      const isSun = dayOfWeek === 0;
                      const isSat = dayOfWeek === 6;
                      const isFirstOfMonth = day === 1;
                      const isLastOfMonth = day === daysInMonth;

                      let roundedClass = 'border-l-0 pl-2';
                      if (isStart || isSun || isFirstOfMonth) roundedClass = 'rounded-l-md pl-2 border-l';
                      
                      let roundedEndClass = 'border-r-0 pr-2';
                      if (isEnd || isSat || isLastOfMonth) roundedEndClass = 'rounded-r-md pr-2 border-r';

                      const showTitle = isStart || isSun || isFirstOfMonth;

                      return (
                        <div key={`day-${day}-prog-${programId}`} className="w-full px-0">
                          <Link 
                            href={`/program/${programId}`}
                            className={`py-1.5 text-xs font-bold block flex-col gap-0.5 border-y transition-all duration-200 cursor-pointer leading-tight select-none z-10 relative ${colorClass} ${roundedClass} ${roundedEndClass}`}
                          >
                            <span className={`truncate block w-full outline-none ${showTitle ? '' : 'invisible'}`}>{prog.title}</span>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

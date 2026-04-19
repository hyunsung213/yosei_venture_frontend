'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimeGaugeBarProps {
  onChange: (start: string, end: string) => void;
}

export default function TimeGaugeBar({ onChange }: TimeGaugeBarProps) {
  // Configuration
  const START_HOUR = 9;
  const BLOCKS = 13; // 9:00 to 22:00 -> 13 intervals of 1 hour

  const [range, setRange] = useState<{ start: number, end: number }>({ start: 0, end: 2 });
  const [isSettingEnd, setIsSettingEnd] = useState(false);

  // Initialize the gauge to current timezone hour
  useEffect(() => {
    const kstHour = new Date(Date.now() + 9 * 60 * 60 * 1000).getHours();
    let defaultStart = kstHour - START_HOUR;
    
    // Safety bounds
    if (defaultStart < 0) defaultStart = 0;
    if (defaultStart > BLOCKS - 2) defaultStart = BLOCKS - 2;
    
    setRange({ start: defaultStart, end: defaultStart + 2 });
  }, []);

  // Sync to parent component safely
  useEffect(() => {
    const stStr = String(START_HOUR + range.start).padStart(2, '0') + ":00";
    const edStr = String(START_HOUR + range.end).padStart(2, '0') + ":00";
    onChange(stStr, edStr);
  }, [range, onChange]);

  const handleBlockClick = (i: number) => {
    if (!isSettingEnd) {
      // Step 1: Select new start boundary. Forces a 2 hour span.
      let newStart = i;
      let newEnd = i + 2;
      
      // Shift left if blocked by the end of the day bounds
      if (newEnd > BLOCKS) {
        newEnd = BLOCKS;
        newStart = Math.max(0, BLOCKS - 2);
      }
      
      setRange({ start: newStart, end: newEnd });
      setIsSettingEnd(true);
    } else {
      // Step 2: Select new end boundary. 
      const newEnd = i + 1;
      
      // Enforce the 2-hour minimum rule strictly
      if (newEnd - range.start < 2) {
        // If clicked too early, restart the process from this new block
        let newStart = i;
        let fallbackEnd = i + 2;
        if (fallbackEnd > BLOCKS) {
           fallbackEnd = BLOCKS;
           newStart = Math.max(0, BLOCKS - 2);
        }
        setRange({ start: newStart, end: fallbackEnd });
        setIsSettingEnd(true); // Still waiting for a valid end
      } else {
        // Successful valid end selection
        setRange({ ...range, end: newEnd });
        setIsSettingEnd(false); // Lock the selection until next click resets it
      }
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
       <div className="flex justify-between items-center mb-3">
         <span className="text-sm font-black text-gray-400">09:00</span>
         <span className="text-[11px] font-bold text-yonsei-blue bg-blue-50 px-3 py-1 rounded-full">
            {isSettingEnd ? '종료 시간을 클릭하세요' : '게이지 바 조작 (최소 2시간)'}
         </span>
         <span className="text-sm font-black text-gray-400">22:00</span>
       </div>
       
       {/* Timeline Track */}
       <div className="relative h-14 w-full flex bg-gray-200 rounded-xl overflow-hidden shadow-inner group">
          {Array.from({ length: BLOCKS }).map((_, i) => {
             const isSelected = i >= range.start && i < range.end;
             const isStartEdge = i === range.start;
             const isEndEdge = i === range.end - 1;

             return (
               <div 
                 key={i} 
                 onClick={() => handleBlockClick(i)}
                 className={`
                    flex-1 h-full border-r border-white/20 cursor-pointer transition-all relative
                    ${isSelected ? 'bg-yonsei-blue shadow-[0_0_12px_rgba(0,56,118,0.4)] z-10 text-white' : 'hover:bg-gray-300 text-gray-400'}
                    ${isStartEdge ? 'rounded-l-xl border-l-[3px] border-l-blue-400' : ''}
                    ${isEndEdge ? 'rounded-r-xl border-r-[3px] border-r-blue-400 border-white/0' : ''}
                 `}
               >
                 {i % 2 === 0 && !isSelected && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] font-bold pointer-events-none opacity-50">
                      {START_HOUR + i}
                    </span>
                 )}
                 {isSelected && isStartEdge && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black pointer-events-none drop-shadow-md">
                      {START_HOUR + range.start}:00
                    </span>
                 )}
                 {isSelected && isEndEdge && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black pointer-events-none drop-shadow-md">
                      {START_HOUR + range.end}:00
                    </span>
                 )}
               </div>
             );
          })}
       </div>
    </div>
  );
}

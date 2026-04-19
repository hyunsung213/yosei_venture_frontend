'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose?: () => void;
}

export default function BookingCalendar({ selectedDate, onSelect, onClose }: BookingCalendarProps) {
  // Initialize with selectedDate or today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  // Determine KST "Today" for disabling past dates
  const todayRaw = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = todayRaw.toISOString().split('T')[0];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Build Calendar Grid
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  // Padding for the first row
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Formatting helper
  const formatYMD = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 p-4 w-full select-none animate-in fade-in zoom-in-95 duration-150">
      
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4 px-2">
         <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative z-10">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
         </button>
         <div className="font-bold text-gray-900 absolute left-0 right-0 text-center pointer-events-none">
            {year}년 {month + 1}월
         </div>
         <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative z-10">
            <ChevronRight className="w-5 h-5 text-gray-700" />
         </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-gray-400">
         {weekDays.map(wd => <span key={wd}>{wd}</span>)}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
         {days.map((d, i) => {
           if (!d) return <div key={i} className="h-10 w-10"></div>; // Empty slot
           
           const dateStr = formatYMD(d);
           const isPast = dateStr < todayStr;
           const isSelected = selectedDate === dateStr;

           return (
             <button
                key={i}
                type="button"
                disabled={isPast}
                onClick={() => {
                   onSelect(dateStr);
                   if(onClose) onClose();
                }}
                className={`
                  h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isSelected ? 'bg-yonsei-blue text-white shadow-md' : ''}
                  ${!isSelected && !isPast ? 'text-gray-700 hover:bg-gray-100' : ''}
                  ${isPast ? 'text-gray-300 cursor-not-allowed opacity-50' : ''}
                `}
             >
                {d}
             </button>
           );
         })}
      </div>
    </div>
  );
}

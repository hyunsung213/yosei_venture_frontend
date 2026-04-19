'use client';

import { useState, useRef, useEffect } from "react";
import { Calendar, Clock, Sparkles, ChevronDown, AlertTriangle } from "lucide-react";
import BookingCalendar from "./BookingCalendar";
import DurationGaugeBar from "./DurationGaugeBar";
import RentalModal from "./RentalModal";
import { getRentalsByPlaceId } from "@/api/get";
import { Rental } from "@/interface/interface";

interface BookingWidgetProps {
  spaceName: string;
  placeId: string;
}

export default function BookingWidget({ spaceName, placeId }: BookingWidgetProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeAccordion, setShowTimeAccordion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [existingRentals, setExistingRentals] = useState<Rental[]>([]);
  const [conflictError, setConflictError] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);

  // 기존 대관 목록 패칭 (추가기능1)
  useEffect(() => {
    async function fetchRentals() {
      const rentals = await getRentalsByPlaceId(placeId);
      setExistingRentals(rentals);
    }
    fetchRentals();
  }, [placeId]);

  // 외부 클릭 시 달력 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 시작/종료 Date 계산
  const getStartEnd = (): { start: Date; end: Date } | null => {
    if (!date) return null;
    const startHour = parseInt(startTime.split(':')[0], 10);
    const endHour = startHour + duration;
    const [year, month, day] = date.split('-').map(Number);
    const start = new Date(year, month - 1, day, startHour, 0, 0);
    const end = new Date(year, month - 1, day + (endHour >= 24 ? 1 : 0), endHour % 24, 0, 0);
    return { start, end };
  };

  // 추가기능1: 선택한 시간이 기존 대관과 겹치는지 확인
  const checkConflict = (start: Date, end: Date): boolean => {
    return existingRentals.some(rental => {
      const rStart = new Date(rental.startDate);
      const rEnd = new Date(rental.endDate);
      // 겹치는 조건: 두 구간이 any overlap
      return start < rEnd && end > rStart;
    });
  };

  // 시간 선택 시 충돌 여부 체크
  const handleTimeSelect = (hour: string) => {
    setStartTime(hour);
    setShowTimeAccordion(false);
    setConflictError("");
  };

  // 특정 시작 시간이 충돌하는지 (시각적 표시용)
  const isHourConflicted = (hourStr: string): boolean => {
    if (!date) return false;
    const startHour = parseInt(hourStr, 10);
    const endHour = startHour + duration;
    const [year, month, day] = date.split('-').map(Number);
    const tryStart = new Date(year, month - 1, day, startHour, 0, 0);
    const tryEnd = new Date(year, month - 1, day + (endHour >= 24 ? 1 : 0), endHour % 24, 0, 0);
    return checkConflict(tryStart, tryEnd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError("");

    if (!date) {
      alert("달력에서 이용 날짜를 선택해주세요.");
      return;
    }

    const range = getStartEnd();
    if (!range) return;

    // 추가기능1: 겹치는 대관 확인
    if (checkConflict(range.start, range.end)) {
      setConflictError("선택하신 시간대에 이미 대관 예약이 있습니다. 다른 시간대를 선택해주세요.");
      return;
    }

    setShowModal(true);
  };

  const endTimeStr = (() => {
    const startHourNum = parseInt(startTime.split(':')[0], 10);
    const endHourNum = startHourNum + duration;
    const isNextDay = endHourNum >= 24;
    const finalEndHour = endHourNum % 24;
    return String(finalEndHour).padStart(2, '0') + ":00" + (isNextDay ? " (다음날)" : "");
  })();

  const range = getStartEnd();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-200 p-6 sticky top-32">
        <div className="mb-6">
          <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yonsei-blue" />
            예약 일정표
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Date Picker */}
          <div className="relative" ref={calendarRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> 이용 날짜
            </label>
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`w-full text-left border py-3 px-4 rounded-xl outline-none transition-all flex justify-between items-center ${showCalendar ? 'border-yonsei-blue ring-2 ring-yonsei-blue/50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <span className={date ? "text-gray-900 font-bold" : "text-gray-400"}>
                {date ? date.replace(/-/g, '. ') : "달력에서 날짜를 선택하세요"}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCalendar ? 'rotate-180 text-yonsei-blue' : ''}`} />
            </button>
            {showCalendar && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50">
                <BookingCalendar selectedDate={date} onSelect={(d) => { setDate(d); setConflictError(""); }} onClose={() => setShowCalendar(false)} />
              </div>
            )}
          </div>

          {/* Start Time Accordion */}
          <div className="relative mt-1">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 시작 시간
            </label>
            <button
              type="button"
              onClick={() => setShowTimeAccordion(!showTimeAccordion)}
              className={`w-full text-left border py-3 px-4 rounded-xl outline-none transition-all flex justify-between items-center ${showTimeAccordion ? 'border-yonsei-blue ring-2 ring-yonsei-blue/50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <span className="text-gray-900 font-bold">{startTime}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTimeAccordion ? 'rotate-180 text-yonsei-blue' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showTimeAccordion ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-4 gap-2 h-48 overflow-y-auto scrollbar-hide">
                {Array.from({ length: 24 }).map((_, i) => {
                  const hour = String(i).padStart(2, '0') + ":00";
                  const isSelected = startTime === hour;
                  const isConflicted = isHourConflicted(String(i).padStart(2, '0'));
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isConflicted}
                      onClick={() => handleTimeSelect(hour)}
                      title={isConflicted ? "이미 예약된 시간대입니다" : undefined}
                      className={`py-2 text-sm font-bold rounded-lg transition-colors relative ${
                        isConflicted
                          ? 'bg-red-50 text-red-300 line-through cursor-not-allowed border border-red-100'
                          : isSelected
                          ? 'bg-yonsei-blue text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200 shadow-sm'
                      }`}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duration Gauge Bar */}
          <div className="mt-1">
            <label className="block text-sm font-bold text-gray-700 mb-3">대여 기간 설정</label>
            <DurationGaugeBar duration={duration} onChange={(d) => { setDuration(d); setConflictError(""); }} />
          </div>

          {/* Booking Summary Box */}
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 my-2 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold">이용 날짜</span>
              <span className="text-gray-900 font-bold">{date ? date.replace(/-/g, '. ') : "선택 안됨"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold">시작 시간</span>
              <span className="text-gray-900 font-bold">{startTime}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold">종료 시간</span>
              <span className="text-gray-900 font-bold">{endTimeStr}</span>
            </div>
            <div className="border-t border-blue-100/80 pt-3 mt-1 flex justify-between items-center text-base">
              <span className="text-gray-900 font-black">총 이용시간</span>
              <span className="text-yonsei-blue font-black text-lg">{duration}시간</span>
            </div>
          </div>

          {/* Conflict Error */}
          {conflictError && (
            <div className="flex gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-900 transition-all mt-2 shadow-md"
          >
            대관 신청하기
          </button>
        </form>
      </div>

      {/* Rental Modal */}
      {showModal && range && (
        <RentalModal
          placeId={placeId}
          spaceName={spaceName}
          startDate={range.start}
          endDate={range.end}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

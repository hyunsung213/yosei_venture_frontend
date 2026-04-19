'use client';

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, Phone, User, Loader2 } from "lucide-react";
import { postRental } from "@/api/post";
import { checkUserRental } from "@/api/get";
import { Rental } from "@/interface/interface";

interface RentalModalProps {
  placeId: string;
  spaceName: string;
  startDate: Date;
  endDate: Date;
  onClose: () => void;
}

export default function RentalModal({ placeId, spaceName, startDate, endDate, onClose }: RentalModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [phoneError, setPhoneError] = useState("");

  const formatDate = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhoneError("");
    setResult(null);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const phoneRaw = (form.elements.namedItem("phone_num") as HTMLInputElement).value.trim();
    
    // 전화번호 유효성 검사
    const phoneDigits = phoneRaw.replace(/[^0-9]/g, '');
    if (!phoneDigits.startsWith('010') || phoneDigits.length !== 11) {
      setPhoneError('010으로 시작하는 11자리 번호를 입력해주세요.');
      return;
    }
    const phone_num = phoneDigits.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');

    // 추가기능2: 현재 활성 대관이 있는지 전화번호로 확인
    setIsChecking(true);
    const userCheck = await checkUserRental(phone_num);
    setIsChecking(false);

    if (userCheck?.hasActive) {
      setResult({
        success: false,
        message: `현재 유효한 대관 예약이 존재합니다. 기존 예약 종료 후 다시 신청해주세요.\n(만료일: ${new Date(userCheck.rental?.endDate).toLocaleDateString('ko-KR')})`,
      });
      return;
    }

    setIsPending(true);

    const rentalData = {
      placeId: placeId,
      name,
      phoneNum: phone_num,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const res = await postRental(rentalData);
    setIsPending(false);

    if (res.success) {
      setResult({ success: true, message: "대관 신청이 완료되었습니다!" });
    } else {
      setResult({ success: false, message: res.message ?? "신청 중 오류가 발생했습니다." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-black text-gray-900">{spaceName}</h3>
            <p className="text-sm text-gray-500 font-medium mt-0.5">대관 신청 정보 입력</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="mx-6 mt-5 bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-black text-yonsei-blue mb-2 uppercase tracking-wider">선택된 일정</p>
          <div className="flex justify-between text-sm font-bold text-gray-800">
            <span>시작</span>
            <span>{formatDate(startDate)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-800 mt-1">
            <span>종료</span>
            <span>{formatDate(endDate)}</span>
          </div>
        </div>

        {/* Success State */}
        {result?.success ? (
          <div className="p-10 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h4 className="text-xl font-black text-gray-900">신청 완료!</h4>
            <p className="text-gray-500 text-sm">{result.message}</p>
            <button onClick={onClose} className="mt-3 px-8 py-3 bg-yonsei-blue text-white font-bold rounded-xl">
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Error Banner */}
            {result && !result.success && (
              <div className="flex gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{result.message}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <User className="w-4 h-4 inline mr-1.5 text-gray-400" />이름
              </label>
              <input
                required
                name="name"
                type="text"
                placeholder="홍길동"
                className="w-full border border-gray-200 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-yonsei-blue/50 bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />전화번호
              </label>
              <input
                required
                name="phone_num"
                type="text"
                placeholder="010-1234-5678"
                className={`w-full border py-3 px-4 rounded-xl outline-none transition-all bg-gray-50 focus:bg-white ${
                  phoneError ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-yonsei-blue/50'
                }`}
              />
              {phoneError && <p className="text-red-500 text-xs mt-1.5 font-bold">{phoneError}</p>}
              <p className="text-xs text-gray-400 mt-1">현재 예약 중인 번호로는 중복 신청이 불가합니다.</p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                취소
              </button>
              <button
                disabled={isPending || isChecking}
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(isPending || isChecking) && <Loader2 className="w-4 h-4 animate-spin" />}
                {isChecking ? '확인 중...' : isPending ? '신청 중...' : '대관 신청'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

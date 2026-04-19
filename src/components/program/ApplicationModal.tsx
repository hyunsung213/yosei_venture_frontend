'use client';

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { postRegistration } from "@/api/post";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ApplicationModal({ programId, programTitle }: { programId: string, programTitle: string }) {
  const { role } = useAuth();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<{phone?: string, studentId?: string, email?: string}>({});
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  const handleOpenClick = () => {
    if (role === 'guest') {
      router.push(`/auth/login?redirect=/program/${programId}`);
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const phoneRaw = formData.get('phone') as string || '';
    const emailRaw = formData.get('email') as string || '';
    const studentIdRaw = formData.get('studentId') as string || '';

    const newErrors: typeof errors = {};

    // 1. Phone Validation
    const phoneDigits = phoneRaw.replace(/[^0-9]/g, '');
    if (!phoneDigits.startsWith('010')) {
      newErrors.phone = '연락처는 "010"으로 시작해야 합니다.';
    } else if (phoneDigits.length !== 11) {
      newErrors.phone = `연락처는 11자리 숫자여야 합니다. (현재 ${phoneDigits.length}자리)`;
    }
    const formattedPhone = phoneDigits.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');

    // 2. Email Validation
    if (!emailRaw.includes('@')) {
      newErrors.email = '이메일 주소에 "@" 기호가 포함되어야 합니다.';
    }

    // 3. Student ID Validation
    if (isStudent) {
      const studentIdDigits = studentIdRaw.replace(/[^0-9]/g, '');
      if (studentIdDigits.length !== 10) {
        newErrors.studentId = `학번은 10자리 숫자여야 합니다. (현재 ${studentIdDigits.length}자리)`;
      }
    }

    // Abort if any errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsPending(false);
      return;
    }
    
    // Clear errors and Prepare data object
    setErrors({});
    
    const registrationData = {
      program_id: programId,
      type: isStudent ? 'student' : 'non-student',
      name: formData.get('name') as string,
      phone_num: formattedPhone,
      email: emailRaw,
      student_id: isStudent ? studentIdRaw.replace(/[^0-9]/g, '') : '',
    };

    try {
      const response = await postRegistration(registrationData);
      setResult(response);
      
      if (response && (response.success || response._id)) {
         setResult({ success: true, message: response.message || "신청이 완료되었습니다." });
         setTimeout(() => {
             setIsOpen(false);
             setResult(null);
         }, 2000);
      }
    } catch (error) {
      setResult({ success: false, message: "접수 중 오류가 발생했습니다." });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleOpenClick}
        className="w-full md:w-auto px-16 py-5 rounded-full font-extrabold text-xl transition-all bg-yonsei-blue text-white hover:bg-blue-900 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
      >
        신청하기
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
               <h3 className="text-xl font-bold text-gray-900 truncate pr-4">
                 {programTitle} 신청
               </h3>
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Success State */}
            {result?.success ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                 <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                 <h4 className="text-2xl font-black text-gray-900 mb-2">접수 완료!</h4>
                 <p className="text-gray-500">{result.message}</p>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6 text-left">
                
                {/* Status Toggle */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">지원자 유형</label>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                       type="button"
                       onClick={() => setIsStudent(true)}
                       className={`py-3 rounded-xl font-bold transition-all ${isStudent ? 'bg-yonsei-blue text-white ring-2 ring-yonsei-blue ring-offset-2' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                     >
                       연세대 학생
                     </button>
                     <button
                       type="button"
                       onClick={() => setIsStudent(false)}
                       className={`py-3 rounded-xl font-bold transition-all ${!isStudent ? 'bg-yonsei-blue text-white ring-2 ring-yonsei-blue ring-offset-2' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                     >
                       일반인
                     </button>
                  </div>
                </div>

                {/* Error Banner */}
                {result && !result.success && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                     {result.message}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">성함</label>
                    <input required name="name" type="text" className="w-full border py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-yonsei-blue/50 transition-shadow bg-gray-50 focus:bg-white" placeholder="홍길동" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">연락처</label>
                    <input required name="phone" type="text" 
                      className={`w-full border py-3 px-4 rounded-xl outline-none transition-shadow bg-gray-50 focus:bg-white 
                        ${errors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-yonsei-blue/50'}`} 
                      placeholder="010-1234-5678" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">이메일</label>
                    <input required name="email" type="text" 
                      className={`w-full border py-3 px-4 rounded-xl outline-none transition-shadow bg-gray-50 focus:bg-white 
                        ${errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-yonsei-blue/50'}`} 
                      placeholder="student@yonsei.ac.kr" />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email}</p>}
                  </div>
                  
                  {/* Conditional Field: Student ID */}
                  {isStudent && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">학번</label>
                      <input required name="studentId" type="text" 
                        className={`w-full border py-3 px-4 rounded-xl outline-none transition-shadow bg-gray-50 focus:bg-white 
                           ${errors.studentId ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-yonsei-blue/50'}`} 
                        placeholder="2026123456" />
                      {errors.studentId && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.studentId}</p>}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="mt-4 pt-6 border-t border-gray-100 flex justify-end gap-3">
                   <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      취소
                   </button>
                   <button disabled={isPending} type="submit" className="px-10 py-3 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {isPending ? '처리 중...' : '신청서 제출'}
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

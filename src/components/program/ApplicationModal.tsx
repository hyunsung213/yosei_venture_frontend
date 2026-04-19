'use client';

import { useState, useEffect } from "react";
import { CheckCircle2, X, Loader2, User, Phone, Mail, GraduationCap } from "lucide-react";
import { postRegistration } from "@/api/post";
import { getMe } from "@/api/get";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ApplicationModal({ programId, programTitle }: { programId: string, programTitle: string }) {
  const { role } = useAuth();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    phone: string;
    email: string;
    studentId?: string;
  } | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  const handleOpenClick = () => {
    if (role === 'guest') {
      router.push(`/auth/login?redirect=/program/${programId}`);
      return;
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (isOpen && role !== 'guest') {
      const fetchUserData = async () => {
        setIsLoadingUser(true);
        try {
          const res = await getMe();
          if (res) {
            setUserData({
              name: res.name || "",
              phone: res.phone || "",
              email: res.email || "",
              studentId: res.studentId || "",
            });
          }
        } catch (err) {
          console.error("User data fetch failed:", err);
        } finally {
          setIsLoadingUser(false);
        }
      };
      fetchUserData();
    }
  }, [isOpen, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setIsPending(true);
    setResult(null);

    const registrationData = {
      programId: programId,
      name: userData.name,
      phone_num: userData.phone,
      email: userData.email,
      student_id: userData.studentId,
    };

    try {
      const response = await postRegistration(registrationData);
      
      if (response && (response.success || response._id || response.id)) {
         setResult({ success: true, message: response.message || "프로그램 신청이 완료되었습니다." });
         setTimeout(() => {
             setIsOpen(false);
             setResult(null);
         }, 2500);
      } else {
        setResult({ success: false, message: response.message || "신청에 실패했습니다. 이미 신청하셨나요?" });
      }
    } catch (error) {
      setResult({ success: false, message: "접수 중 서버 오류가 발생했습니다." });
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
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
               <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">프로그램 신청</h3>
                  <p className="text-sm text-gray-500 font-medium truncate max-w-[300px]">
                    {programTitle}
                  </p>
               </div>
               <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="p-8">
              {result?.success ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                   </div>
                   <h4 className="text-2xl font-black text-gray-900 mb-2">접수 완료!</h4>
                   <p className="text-gray-500 font-medium">{result.message}</p>
                </div>
              ) : isLoadingUser ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
                  <p className="font-bold">회원 정보를 확인하고 있습니다...</p>
                </div>
              ) : (
                /* Form State */
                <div className="flex flex-col gap-8">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                     <p className="text-sm text-blue-700 font-bold flex items-start gap-2">
                        <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        아래의 회원 정보로 신청이 진행됩니다. 정보가 정확한지 확인해 주세요.
                     </p>
                  </div>

                  <div className="space-y-5">
                    <InfoRow icon={User} label="성함" value={userData?.name} />
                    <InfoRow icon={Phone} label="연락처" value={userData?.phone} />
                    <InfoRow icon={Mail} label="이메일" value={userData?.email} />
                    {userData?.studentId && (
                       <InfoRow icon={GraduationCap} label="학번" value={userData?.studentId} />
                    )}
                  </div>

                  {result && !result.success && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
                       {result.message}
                    </div>
                  )}

                  {/* Submit Action */}
                  <div className="flex flex-col gap-3 mt-4">
                     <button 
                        disabled={isPending || !userData} 
                        onClick={handleSubmit}
                        className="w-full py-4 rounded-2xl font-black text-lg text-white bg-yonsei-blue hover:bg-blue-800 transition-all shadow-lg shadow-yonsei-blue/20 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                     >
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : '정보 확인 및 신청하기'}
                     </button>
                     <button onClick={() => setIsOpen(false)} className="w-full py-4 rounded-xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                        취소
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) {
  return (
    <div className="flex items-center gap-4 group">
      {/* 왼쪽: 아이콘 박스 (회색 배경, 호버 시 파란색) */}
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-yonsei-blue transition-all">
        <Icon className="w-5 h-5" />
      </div>
      
      {/* 오른쪽: 라벨과 실제 정보 값 */}
      <div className="flex-1">
        <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</span>
        <span className="block text-base font-bold text-gray-900 leading-none">{value || "-"}</span>
      </div>
    </div>
  );
}
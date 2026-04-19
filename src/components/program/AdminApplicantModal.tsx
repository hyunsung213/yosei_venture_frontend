'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRegistrationsByProgramId } from "@/api/get"; // 백엔드 API 연동
import { Users, Download, X } from "lucide-react";

export default function AdminApplicantModal({ 
  programId, 
  variant = 'full' 
}: { 
  programId: string, 
  variant?: 'full' | 'header' 
}) {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin || !isOpen) return;
    
    async function fetchDb() {
       setIsLoading(true);
       try {
         const apps = await getRegistrationsByProgramId(programId);
         setData(apps || []);
       } catch (error) {
         console.error("신청 명단 로드 실패:", error);
         setData([]);
       } finally {
         setIsLoading(false);
       }
    }
    
    fetchDb();
  }, [isAdmin, isOpen, programId]);

  if (!isAdmin) return null;

  const buttonClass = variant === 'header'
    ? "flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors shadow-sm border border-red-100"
    : "w-full md:w-auto px-10 py-5 rounded-full font-bold text-lg transition-all bg-red-50 text-red-600 hover:bg-red-100 shadow-sm border border-red-200 flex items-center justify-center gap-2";

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={buttonClass}
      >
        <Users className={variant === 'header' ? "w-4 h-4" : "w-5 h-5"} />
        {variant === 'header' ? "신청 목록" : "신청자 목록 조회"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
             
             {/* Header */}
             <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 bg-gray-50 flex-shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <Users className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-gray-900">신청자 명단 리포트</h2>
                    <p className="text-sm font-bold text-gray-500 mt-1">총 {data.length}명의 지원자가 접수되었습니다.</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4">
                 <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg transition-colors shadow-sm">
                   <Download className="w-4 h-4" />
                   엑셀 다운로드 (목업)
                 </button>
                 <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full border border-transparent hover:border-gray-200 hover:shadow-sm">
                   <X className="w-6 h-6" />
                 </button>
               </div>
             </div>

             {/* Body */}
             <div className="overflow-y-auto p-6 md:p-8 bg-gray-50/50 flex-1">
               {isLoading ? (
                  <div className="py-20 text-center text-gray-400 font-bold">데이터를 불러오는 중입니다...</div>
               ) : data.length === 0 ? (
                  <div className="py-20 bg-white rounded-2xl text-center text-gray-500 font-medium border border-gray-100 shadow-sm">
                     아직 접수된 신청 내역이 없습니다.
                  </div>
               ) : (
                  <div className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                       <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                          <tr>
                            <th className="px-6 py-4 font-black">지원 유형</th>
                            <th className="px-6 py-4 font-black">이름</th>
                            <th className="px-6 py-4 font-black">학번</th>
                            <th className="px-6 py-4 font-black">연락처</th>
                            <th className="px-6 py-4 font-black">이메일</th>
                            <th className="px-6 py-4 font-black text-right">신청 일시</th>
                          </tr>
                       </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                           {data.map((row, i) => {
                             // 백엔드 인터페이스(IRegistration)와 기존 목업 데이터 필드명 대응
                             const type = row.type || row.statusType;
                             const name = row.name;
                             const studentId = row.student_id || row.studentId;
                             const phone = row.phone_num || row.phone;
                             const email = row.email;
                             const date = row.createdAt || row.submittedAt;

                             return (
                               <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                  <td className="px-6 py-4 font-medium">
                                    {type === 'student' ? (
                                      <span className="text-yonsei-blue bg-blue-100/50 border border-yonsei-blue/20 px-3 py-1 rounded-full text-xs font-bold">연대생</span>
                                    ) : (
                                      <span className="text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold">일반인</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-gray-900">{name}</td>
                                  <td className="px-6 py-4 font-medium text-gray-500">{studentId || '-'}</td>
                                  <td className="px-6 py-4 text-gray-600">{phone}</td>
                                  <td className="px-6 py-4 text-gray-600">{email}</td>
                                  <td className="px-6 py-4 text-gray-400 text-right text-xs">
                                     {date ? new Date(date).toLocaleString('ko-KR') : '-'}
                                  </td>
                               </tr>
                             );
                           })}
                        </tbody>
                    </table>
                  </div>
               )}
             </div>
          </div>
        </div>
      )}
    </>
  );
}

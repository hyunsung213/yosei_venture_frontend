'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getApplications } from "@/app/actions/getApplications";
import { Users, Download } from "lucide-react";

export default function AdminApplicantTable({ programId }: { programId: string }) {
  const { role } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role !== 'super') return;
    
    async function fetchDb() {
       setIsLoading(true);
       const apps = await getApplications(programId);
       setData(apps);
       setIsLoading(false);
    }
    
    fetchDb();
  }, [role, programId]);

  if (role !== 'super') return null;

  return (
    <div className="mt-16 pt-10 border-t-2 border-red-100">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                <Users className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-900">관리자 전용: 신청자 목록</h2>
                <p className="text-xs font-bold text-gray-500 mt-0.5">총 {data.length}명의 지원자가 접수되었습니다.</p>
             </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            엑셀 다운로드 (목업)
          </button>
       </div>

       {isLoading ? (
          <div className="py-12 text-center text-gray-400 font-bold">데이터를 불러오는 중입니다...</div>
       ) : data.length === 0 ? (
          <div className="py-12 bg-gray-50 rounded-2xl text-center text-gray-500 font-medium border border-gray-100">
             아직 접수된 신청 내역이 없습니다.
          </div>
       ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-left bg-white whitespace-nowrap">
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
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-medium">
                         {row.statusType === 'student' ? (
                           <span className="text-yonsei-blue bg-blue-50 px-2 py-1 rounded">연대생</span>
                         ) : (
                           <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">일반인</span>
                         )}
                       </td>
                       <td className="px-6 py-4 font-bold text-gray-900">{row.name}</td>
                       <td className="px-6 py-4 font-medium text-gray-500">{row.studentId || '-'}</td>
                       <td className="px-6 py-4 text-gray-600">{row.phone}</td>
                       <td className="px-6 py-4 text-gray-600">{row.email}</td>
                       <td className="px-6 py-4 text-gray-400 text-right text-xs">
                          {new Date(row.submittedAt).toLocaleString('ko-KR')}
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
       )}
    </div>
  );
}

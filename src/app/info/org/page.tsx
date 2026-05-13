'use client';

import { Phone } from "lucide-react";
import React from "react";
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export default function OrganizationPage() {
  const organization = {
    manager: {
      role: "미래창업지원단 실무 업무 총괄, RISE프로젝트 실무 총괄",
      ext: "033-760-5020"
    },
    staffs: [
      {
        role: "창업체험교육플랫폼, 교내 창업공간 지원, WAVE Bridge(Series)",
        ext: "033-760-5021"
      },
      {
        role: "창업교과목, Wave-Lab, 창업동아리",
        ext: "033-760-5022"
      },
      {
        role: "창업교육(비정규), 지역민 창업교육, WAVE Bridge(Academy)",
        ext: "033-760-5023"
      }
    ],
    support: {
      role: "창업교육센터 업무지원, 창업기업지원센터 업무지원",
      ext: "033-760-5018"
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14 mb-8 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-yonsei-blue text-white">
            <th className="px-5 py-3.5 text-left font-bold rounded-tl-xl w-28">직책</th>
            <th className="px-5 py-3.5 text-left font-bold">담당 업무</th>
            <th className="px-5 py-3.5 text-left font-bold rounded-tr-xl w-44 whitespace-nowrap">내선번호</th>
          </tr>
        </thead>
        <tbody>
          {/* Manager */}
          <tr className="border-b border-gray-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
            <td className="px-5 py-4 font-bold text-yonsei-blue whitespace-nowrap">과장님</td>
            <td className="px-5 py-4 text-gray-600 font-medium leading-relaxed">{organization.manager.role}</td>
            <td className="px-5 py-4 whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-yonsei-blue text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {organization.manager.ext}
              </span>
            </td>
          </tr>

          {/* Staffs */}
          {organization.staffs.map((staff, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-5 py-4 font-bold text-gray-500 whitespace-nowrap">선생님</td>
              <td className="px-5 py-4 text-gray-600 font-medium leading-relaxed">{staff.role}</td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {staff.ext}
                </span>
              </td>
            </tr>
          ))}

          {/* Support */}
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4 font-bold text-gray-500 whitespace-nowrap">근로장학생</td>
            <td className="px-5 py-4 text-gray-600 font-medium leading-relaxed">{organization.support.role}</td>
            <td className="px-5 py-4 whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {organization.support.ext}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <AdminContentEditor where="organization" initialData={organization} />
    </div>
  );
}

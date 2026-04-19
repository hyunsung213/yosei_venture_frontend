'use client';

import { useEffect, useState } from "react";
import { UserCircle2, Phone } from "lucide-react";
import React from "react";
import { getOrganization } from "@/api/getInfo";
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export default function OrganizationPage() {
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await getOrganization();
      setOrganization(data);
    }
    load();
  }, []);

  if (!organization) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">Loading...</div>;

  const renderCard = (title: string, person: { name: string; role: string; ext: string }, accentColor: string) => (
    <div className={`h-full bg-white rounded-xl p-6 border-t-4 ${accentColor} border-x border-b border-gray-100 shadow-sm flex flex-col items-center text-center w-full max-w-xs mx-auto`}>
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
        <UserCircle2 className="w-10 h-10" />
      </div>
      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full mb-3">{title}</span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{person.name}</h3>
      <p className="text-gray-600 font-medium text-sm leading-relaxed mb-4 break-keep">{person.role}</p>
      <div className="mt-auto flex items-center gap-1.5 text-yonsei-blue text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg">
        <Phone className="w-3.5 h-3.5" />
        {person.ext}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14 mb-8 flex flex-col items-center w-full">
      
      {/* Top Manager */}
      <div className="relative flex flex-col items-center z-10">
        {renderCard("실무 총괄", organization.manager, "border-t-yonsei-blue")}
        {/* Connector Line down */}
        <div className="w-px h-8 bg-gray-300 my-0"></div>
      </div>

      {/* Staffs Level */}
      <div className="relative flex flex-col items-center w-full">
        {/* Horizontal Connector */}
        <div className="absolute top-0 w-full max-w-2xl h-px bg-gray-300"></div>
        
        <div className="flex flex-row justify-center gap-4 md:gap-8 w-full max-w-4xl relative">
          {organization.staffs.map((staff: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex-grow w-full">
                {renderCard("담당관", staff, "border-t-gray-400")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Level (underneath without connecting line, horizontal wide card) */}
      <div className="relative flex justify-center w-full mt-10">
        <div className="bg-white rounded-xl p-6 border-l-4 border-l-gray-300 border-y border-r border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 w-full max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 flex-shrink-0">
            <UserCircle2 className="w-10 h-10" />
          </div>
          <div className="flex flex-col items-center sm:items-start flex-1">
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full mb-3">국가근로지원</span>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{organization.support.name}</h3>
            <p className="text-gray-600 font-medium text-sm leading-relaxed break-keep mb-0">{organization.support.role}</p>
          </div>
          <div className="flex items-center gap-1.5 text-yonsei-blue text-xs font-bold bg-blue-50 px-3 py-2 rounded-lg sm:mt-auto whitespace-nowrap">
            <Phone className="w-4 h-4" />
            {organization.support.ext}
          </div>
        </div>
      </div>
      <AdminContentEditor where="organization" initialData={organization} />
    </div>
  );
}

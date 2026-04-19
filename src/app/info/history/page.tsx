'use client';

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getHistory } from "@/api/getInfo";
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export interface HistoryRecord {
  year: string;
  milestones: string[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getHistory();

      if (data && data.items) {
        const formattedData: HistoryRecord[] = data.items.map((str: string) => {
          const firstSpaceIndex = str.indexOf(' ');
          return {
            year: str.substring(0, firstSpaceIndex) || "Info", 
            milestones: [str.substring(firstSpaceIndex + 1)]
          };
        });
        setHistory(formattedData);
      }
    };
    load();
  }, []);

  if (!history) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">Loading...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14 mb-8">
      <div className="relative w-full max-w-4xl mx-auto py-4">
        {/* Center vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>
        
        <div className="space-y-6">
          {history.map((record, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="relative flex items-start justify-between w-full">
                
                {/* Left Side */}
                <div className={`w-5/12 text-right pr-8 ${!isEven ? 'invisible' : ''}`}>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight leading-none">
                    {record.year}
                  </h3>
                  <div className="space-y-2 flex flex-col items-end">
                    {record.milestones.map((ms, j) => (
                      <div key={j} className="flex gap-3 items-start justify-end group">
                        <p className="text-lg text-gray-600 font-medium leading-relaxed break-keep group-hover:text-gray-900 transition-colors text-right">
                          {ms}
                        </p>
                        <CheckCircle2 className="w-5 h-5 text-gray-300 mt-0.5 group-hover:text-yonsei-blue transition-colors flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yonsei-blue rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 mt-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* Right Side */}
                <div className={`w-5/12 text-left pl-8 ${isEven ? 'invisible' : ''}`}>
                  <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight leading-none">
                    {record.year}
                  </h3>
                  <div className="space-y-2">
                    {record.milestones.map((ms, j) => (
                      <div key={j} className="flex gap-3 items-start group">
                        <CheckCircle2 className="w-5 h-5 text-gray-300 mt-0.5 group-hover:text-yonsei-blue transition-colors flex-shrink-0" />
                        <p className="text-lg text-gray-600 font-medium leading-relaxed break-keep group-hover:text-gray-900 transition-colors">
                          {ms}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <AdminContentEditor where="history" initialData={history} />
    </div>
  );
}

'use client';

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { getGreetings } from "@/api/getInfo";
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export default function Sub1Greetings() {
  const [greetings, setGreetings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getGreetings();
      setGreetings(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading || !greetings) {
    return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-14 mb-8 flex flex-col items-center text-center">
      
      {/* Blockquote Vision */}
      <div className="mb-14 relative bg-gray-50 p-8 md:p-12 rounded-xl border-t-4 border-yonsei-blue w-full max-w-3xl">
        <Quote className="absolute top-6 left-6 text-gray-200 w-16 h-16 transform -rotate-12" />
        <div className="relative z-10">
          <p className="text-xl md:text-2xl font-light text-gray-800 leading-relaxed break-keep">
            "{greetings.quote}"
          </p>
        </div>
      </div>

      {/* Main Letter Body */}
      <div className="space-y-6 text-gray-700 text-lg leading-loose font-light break-keep max-w-3xl">
        {greetings.paragraphs.map((para: string, index: number) => (
          <p key={index}>{para}</p>
        ))}
      </div>

      {/* Signature Section */}
      <div className="mt-20 flex flex-col items-center">
        <p className="text-gray-500 mb-2">연세대학교 미래캠퍼스 창업지원단장</p>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-gray-900">{greetings.director}</span>
          <span className="font-serif italic text-4xl text-gray-400 opacity-60 pointer-events-none select-none">
            {greetings.signatureText}
          </span>
        </div>
      </div>

      <AdminContentEditor where="greetings" initialData={greetings} />
    </div>
  );
}

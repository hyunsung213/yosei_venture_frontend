'use client';

import { MapPin, PhoneCall, Mail } from "lucide-react";

export default function LocationPage() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      {/* Left Text Info (40%) */}
      <div className="w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-between gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-gray-100 pb-3">Address</h3>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-blue-100">
              <MapPin className="w-5 h-5 text-yonsei-blue" />
            </div>
            <div className="flex-1 mt-0.5">
              <p className="text-base font-black text-gray-900 mb-1 leading-tight">강원특별자치도 원주시 흥업면 연세대길1 학생회관</p>
              <p className="text-sm text-gray-500 font-medium">2층 229호</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-gray-100 pb-3">Contact</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
                <PhoneCall className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-base font-black text-gray-900 tracking-tight">033-760-5018</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
                <Mail className="w-5 h-5 text-gray-700" />
              </div>
              <p className="text-base font-black text-gray-900 tracking-tight">wave@yonsei.ac.kr</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Map (60%) */}
      <div className="w-full md:w-[60%] min-h-[400px] md:min-h-[500px] bg-gray-200">
         <iframe
          src="https://maps.google.com/maps?q=강원특별자치도 원주시 흥업면 연세대길1 학생회관&t=&z=16&ie=UTF8&iwloc=B&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="연세대학교 미래캠퍼스 학생회관 지도"
        />
      </div>
      </div>
    </div>
  );
}

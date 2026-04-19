'use client';

import { useEffect, useState } from "react";
import { MapPin, PhoneCall } from "lucide-react";
import { getAddressInfo, getPhone } from "@/api/getInfo";
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export default function LocationPage() {
  const [addressInfo, setAddressInfo] = useState<any>(null);
  const [phone, setPhone] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [addrData, phoneData] = await Promise.all([
        getAddressInfo(),
        getPhone()
      ]);
      setAddressInfo(addrData);
      setPhone(phoneData);
    }
    load();
  }, []);

  if (!addressInfo || !phone) return <div className="h-96 flex items-center justify-center animate-pulse text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      {/* Left Text Info (40%) */}
      <div className="w-full md:w-[40%] p-8 md:p-12 flex flex-col justify-between">
        <div className="mb-10 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-gray-100 pb-3">Address</h3>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-blue-100">
              <MapPin className="w-7 h-7 text-yonsei-blue" />
            </div>
            <div className="flex-1">
              <p className="text-xl font-black text-gray-900 mb-1.5 leading-tight">{addressInfo.main_address}</p>
              <p className="text-lg text-gray-500 font-medium">{addressInfo.sub_address}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 border-b border-gray-100 pb-3">Contact</h3>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
              <PhoneCall className="w-7 h-7 text-gray-700" />
            </div>
            <p className="text-xl font-black text-gray-900 tracking-tight">{phone}</p>
          </div>
        </div>
      </div>
      
      {/* Right Map (60%) */}
      <div className="w-full md:w-[60%] min-h-[400px] md:min-h-[500px] bg-gray-200">
         <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.576059960241!2d127.89862831531005!3d37.28117797985223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3563725b828d5469%3A0xcbcb7cc00f2e0ec!2z7Jew7IS464yA7ZWZ6rWQIOuvuOuemOy6oO2NvOyKpA!5e0!3m2!1sko!2skr!4v1689230559196!5m2!1sko!2skr"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="연세대학교 미래캠퍼스 지도"
        />
      </div>
      </div>
      <AdminContentEditor where="location" initialData={{ addressInfo, phone }} />
    </div>
  );
}

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50">
      <div className="bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center max-w-lg mx-4">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          접근 권한이 없습니다
        </h1>
        
        <p className="text-gray-500 mb-8 leading-relaxed font-light break-keep">
          요청하신 페이지는 특정 권한 그룹만 접근할 수 있습니다. <br className="hidden sm:block" />
          해당 서비스 이용을 원하시면 로그인을 진행해 주시기 바랍니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            type="button" 
            className="flex-1 bg-yonsei-blue text-white font-bold py-3 px-6 rounded-xl shadow-sm shadow-blue-500/20 hover:bg-blue-800 transition-colors duration-300"
          >
            로그인 하기
          </button>
          
          <Link 
            href="/"
            className="flex-1 bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-200"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}

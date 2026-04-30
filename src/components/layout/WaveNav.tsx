'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const baseTabs = [
  { name: "사업개요", href: "/wave/about" },
  { name: "팀 소개", href: "/wave/teams-info" },
  { name: "공지사항", href: "/wave/notice" },
  { name: "Q&A", href: "/wave/qa" },
  { name: "팀 관리", href: "/wave/team" },
];

const waveTabs = [
  { name: "사업개요", href: "/wave/about" },
  { name: "팀 소개", href: "/wave/teams-info" },
  { name: "공지사항", href: "/wave/notice" },
  { name: "Q&A", href: "/wave/qa" },
  { name: "팀 관리", href: "/wave/team" },
];

export default function WaveNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const tabs = (role === 'wave' || role === 'super') ? waveTabs : baseTabs;

  const currentTab = tabs.find(tab => pathname === tab.href || pathname?.startsWith(tab.href + '/')) || tabs[0];

  return (
    <div className="w-full bg-transparent pt-12 pb-4 border-b border-gray-200 mb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Sector Name Heading - Center Aligned */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
          {currentTab.name}
        </h1>

        {/* Horizontal Sub-Navigation - Center Aligned */}
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2 scrollbar-hide justify-center w-full">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`whitespace-nowrap py-2.5 px-5 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-yonsei-blue text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-yonsei-blue"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

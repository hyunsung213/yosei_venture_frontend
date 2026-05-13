'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "인사말", href: "/info/intro" },
  { name: "연혁", href: "/info/history" },
  { name: "조직도", href: "/info/org" },
  // { name: "시설 현황", href: "/info/facility" },
  { name: "오시는 길", href: "/info/location" },
];

export default function CenterInfoNav() {
  const pathname = usePathname();
  
  // Determine current active tab
  const currentTab = tabs.find(tab => pathname?.startsWith(tab.href)) || tabs[0];

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
            const isActive = pathname === tab.href;
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

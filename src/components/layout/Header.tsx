"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
  const [isMobileProgramOpen, setIsMobileProgramOpen] = useState(false);
  const [isMobileWaveOpen, setIsMobileWaveOpen] = useState(false);
  const [isMobileCommunityOpen, setIsMobileCommunityOpen] = useState(false);

  const { role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "";

  const isInfoActive = pathname.startsWith("/info");
  const isProgramActive = pathname.startsWith("/program");
  const isWaveActive = pathname.startsWith("/wave");
  const isCommunityActive = pathname.startsWith("/community");

  const infoLinks = [
    { name: "센터소개", href: "/info/intro" },
    { name: "연혁", href: "/info/history" },
    // { name: "시설현황", href: "/info/facility" },
    { name: "조직도", href: "/info/org" },
    { name: "오시는 길", href: "/info/location" },
  ];

  const programLinks = [
    { name: "프로그램 목록", href: "/program/list" },
    { name: "캘린더", href: "/program/calendar" },
  ];

  const waveLinks = [
    { name: "사업개요", href: "/wave/about" },
    { name: "팀 소개", href: "/wave/teams-info" },
    { name: "공지사항", href: "/wave/notice" },
    { name: "Q&A", href: "/wave/qa" },
    ...(role === 'super' || role === 'wave' ? [{ name: "팀 관리", href: "/wave/team" }] : []),
  ];

  const communityLinks = [
    { name: "공지사항", href: "/community/notice" },
    { name: "뉴스", href: "/community/news" },
    { name: "Q&A", href: "/community/qa" },
  ];

  const renderDropdown = (title: string, isActive: boolean, links: {name: string, href: string}[]) => (
    <div className="relative group h-20 flex items-center">
      <Link
        href={links[0].href}
        className={`text-sm font-bold transition-colors flex items-center gap-1 ${isActive ? "text-yonsei-blue" : "text-gray-700 hover:text-yonsei-blue"}`}
      >
        {title}
        <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
      </Link>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
        <div className="py-2 flex flex-col">
          {links.map((link) => {
            const isSubActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-3 text-sm transition-colors font-bold ${isSubActive ? "bg-blue-50 text-yonsei-blue" : "text-gray-700 hover:bg-gray-50 hover:text-yonsei-blue"}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderMobileAccordion = (title: string, isActive: boolean, openState: boolean, toggleFn: () => void, links: {name: string, href: string}[]) => (
    <div>
      <button
        onClick={toggleFn}
        className={`w-full text-left px-3 py-2 rounded-md text-base font-bold flex justify-between items-center transition-colors ${isActive ? "text-yonsei-blue bg-blue-50" : "text-gray-700 hover:text-yonsei-blue hover:bg-gray-50"}`}
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openState ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openState ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="pl-6 pb-2 space-y-1 flex flex-col">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${pathname === link.href ? "text-yonsei-blue bg-blue-50/50" : "text-gray-500 hover:text-yonsei-blue hover:bg-gray-50"}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center transition-colors duration-300">
                <Image src="/image/yonsei_logo.png" alt="Logo" width={50} height={50} />
              </div>
              <span className="font-bold text-lg text-yonsei-blue leading-tight">
                연세대학교<br />미래 창업지원단
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {renderDropdown("센터소개", isInfoActive, infoLinks)}
            {renderDropdown("프로그램", isProgramActive, programLinks)}
            {renderDropdown("WAVE-LAB", isWaveActive, waveLinks)}
            {renderDropdown("커뮤니티", isCommunityActive, communityLinks)}
            {role === 'super' && (
              <Link href="/dashboard" className={`text-sm font-bold transition-colors ${pathname.startsWith('/dashboard') ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}>
                관리자 대시보드
              </Link>
            )}

            {/* Auth / User Buttons */}
            <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-200">
              {role === "guest" ? (
                <button
                  onClick={() => router.push("/auth/login")}
                  className="px-5 py-2 bg-yonsei-blue text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-800 transition-colors"
                >
                  로그인
                </button>
              ) : (
                <>
                  {/* My Page Icon */}
                  <Link
                    href="/mypage"
                    className={`p-2 rounded-full transition-colors ${pathname === '/mypage' ? 'bg-yonsei-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="마이페이지"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={logout}
                    className="px-5 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {role !== "guest" && (
              <Link href="/mypage" className="p-2 text-gray-600 hover:text-yonsei-blue">
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-yonsei-blue focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="px-4 py-4 space-y-2">
            {/* Auth Section */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">
                  {role === "guest" ? "로그인이 필요합니다" : "로그인 중"}
                </span>
                {role === "guest" ? (
                  <button
                    onClick={() => { router.push("/auth/login"); setIsMobileMenuOpen(false); }}
                    className="px-4 py-1.5 bg-yonsei-blue text-white rounded-md text-xs font-bold"
                  >
                    로그인
                  </button>
                ) : (
                  <button
                    onClick={logout}
                    className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-bold"
                  >
                    로그아웃
                  </button>
                )}
              </div>
            </div>

            {renderMobileAccordion("센터소개", isInfoActive, isMobileInfoOpen, () => setIsMobileInfoOpen(!isMobileInfoOpen), infoLinks)}
            {renderMobileAccordion("프로그램", isProgramActive, isMobileProgramOpen, () => setIsMobileProgramOpen(!isMobileProgramOpen), programLinks)}
            {renderMobileAccordion("WAVE-LAB", isWaveActive, isMobileWaveOpen, () => setIsMobileWaveOpen(!isMobileWaveOpen), waveLinks)}
            {renderMobileAccordion("커뮤니티", isCommunityActive, isMobileCommunityOpen, () => setIsMobileCommunityOpen(!isMobileCommunityOpen), communityLinks)}
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ApplicationModal from "@/components/program/ApplicationModal";
import AdminApplicantModal from "@/components/program/AdminApplicantModal";
import AdminEditButton from "@/components/program/AdminEditButton";
import Link from "next/link";
import { ArrowLeft, Loader2, FileText, Download, ChevronDown } from "lucide-react";
import { getCleanFileName, getImage } from "@/utils/imageUtils";
import { ProgramForSuper } from "@/interface/interface";
import { getProgramById } from "@/api/get";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function ProgramDetailPage() {
  const params = useParams();
  const programId = params.id as string;
  const { userId } = useAuth();

  const [program, setProgram] = useState<ProgramForSuper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [showMoreButton, setShowMoreButton] = useState(false);

  useEffect(() => {
    if (!programId) return;

    const fetchProgram = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getProgramById(programId);
        if (!result) {
          setError("프로그램을 찾을 수 없습니다.");
        } else {
          setProgram(result);
        }
      } catch (err) {
        console.error(err);
        setError("프로그램 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  // 본문 높이 체크하여 "더보기" 버튼 노출 여부 결정
  useEffect(() => {
    if (program && contentRef.current) {
      if (contentRef.current.scrollHeight > 500) {
        setShowMoreButton(true);
      }
    }
  }, [program]);

  // D-Day 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(program?.endDate ?? "");
  endDate.setHours(23, 59, 59, 999);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isActive = program ? diffDays >= 0 : false;
  const dDayStr = diffDays === 0 ? "D-Day" : diffDays > 0 ? `D-${diffDays}` : "모집 마감";

  const formatDate = (d?: string | Date) =>
    d ? new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }) : "-";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">프로그램 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-red-500">
        <p className="font-bold text-lg">{error ?? "프로그램을 찾을 수 없습니다."}</p>
        <Link href="/program/list" className="text-sm text-gray-500 hover:text-yonsei-blue underline transition-colors">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-12 md:mt-16 bg-white shadow-sm rounded-2xl border border-gray-100">

      {/* Back Navigation & Admin Action */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/program/list" className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          목록으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <AdminApplicantModal programId={programId} variant="header" />
          <AdminEditButton programId={programId} />
        </div>
      </div>

      {/* Header Info */}
      <section className="mb-10 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
          <span className={`px-4 py-2 rounded-full font-black text-sm shadow-sm border
            ${isActive ? "bg-red-600 text-white border-red-700/50" : "bg-gray-500 text-white border-gray-600/50"}`}
          >
            {dDayStr}
          </span>
          <span className="text-gray-500 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            지원 기간: {formatDate(program.startDate)} ~ {formatDate(program.endDate)}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight break-keep mb-6">
          {program.title}
        </h1>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
          <div className="flex items-center gap-6 bg-yonsei-blue/5 border border-yonsei-blue/10 px-6 py-3 rounded-2xl shadow-sm">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter block mb-1">모집 정원</span>
              <span className="text-xl font-black text-gray-900">{program.capacity}명</span>
            </div>
            <div className="w-px h-8 bg-yonsei-blue/20" />
            <div className="text-center md:text-left">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter block mb-1">확정 인원</span>
              <span className="text-xl font-black text-yonsei-blue">{program.registrationCount ?? 0}명</span>
            </div>
            {program.pendingRegistrationCount !== undefined && (
              <>
                <div className="w-px h-8 bg-yonsei-blue/20" />
                <div className="text-center md:text-left">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-tighter block mb-1">검토 중</span>
                  <span className="text-xl font-black text-red-600">{program.pendingRegistrationCount}명</span>
                </div>
              </>
            )}
          </div>
          
          {program.hashTags && (
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              {program.hashTags.map((tag, i) => (
                <span key={i} className="bg-white text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          Section 1: Top (Poster & Files)
          ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-10 gap-8 mb-12 items-stretch">
        {/* Left: Poster */}
        <div className="md:col-span-4 h-full">
          <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
            <Image
              src={getImage((program as any).poster_url ?? (program as any).image ?? (program as any).poster)}
              alt={`${program.title} 포스터`}
              fill
              className="object-contain p-2"
            />
          </div>
        </div>

        {/* Right: Files List */}
        <div className="md:col-span-6 flex flex-col h-full">
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 md:p-8 flex-1 flex flex-col">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yonsei-blue" />
              첨부파일 및 공고문
            </h3>

            {(() => {
              // 백엔드 필드 규격 동기화 (file)
              const rawFiles = program.files || [];
              const filesArray = Array.isArray(rawFiles) ? rawFiles : [rawFiles].filter(Boolean);

              return filesArray.length > 0 ? (
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {filesArray.map((file, idx) => {
                    // 객체(url, originalName)인 경우와 단순 문자열인 경우 모두 대응
                    const isObject = typeof file === 'object' && file !== null;
                    const fileUrl = isObject ? (file as any).url : String(file);
                    
                    // originalName이 있으면 사용, 없으면 파일 경로에서 추출하여 인코딩 깨짐 대비
                    const fileName = isObject ? (file as any).originalName : getCleanFileName(String(file));

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-yonsei-blue/30 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-yonsei-blue flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-gray-700 truncate text-sm md:text-base">
                            {fileName}
                          </span>
                        </div>
                        <a
                          href={getImage(fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2.5 bg-gray-50 text-gray-500 hover:bg-yonsei-blue hover:text-white rounded-lg transition-all flex items-center gap-2 text-xs font-black flex-shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">다운로드</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-dashed border-gray-100 rounded-xl py-12">
                  <FileText className="w-10 h-10 opacity-20" />
                  <p className="font-medium text-sm">등록된 첨부파일이 없습니다.</p>
                </div>
              );
            })()}
            
            <p className="mt-6 text-xs text-gray-400 font-medium">
              * 파일이 보이지 않을 경우 관리자에게 문의해주시기 바랍니다.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          Section 2: Middle (Content with Expand)
          ────────────────────────────────────────────────────────── */}
      <section className="relative mb-16 pt-10 border-t border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-8 border-l-4 border-yonsei-blue pl-4">
          프로그램 상세 안내
        </h3>

        <div 
          ref={contentRef}
          className={`prose prose-lg max-w-none text-gray-700 font-medium leading-relaxed whitespace-pre-wrap transition-all duration-500 ease-in-out relative
            ${!isExpanded && showMoreButton ? "max-h-[300px] overflow-hidden" : "max-h-full"}`}
        >
          {program.content}

          {/* Fade Overlay: 하단으로 갈수록 불투명해지는 그라데이션 */}
          {!isExpanded && showMoreButton && (
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/95 to-transparent z-10" />
          )}
        </div>

        {/* More Button: 흐릿한 글씨와 통통 튀는 화살표 애니메이션 */}
        {!isExpanded && showMoreButton && (
          <div className="flex justify-center mt-[-10px] relative z-20">
            <motion.button
              onClick={() => setIsExpanded(true)}
              animate={{ y: [0, 8, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="group flex flex-col items-center gap-1 text-gray-400 hover:text-yonsei-blue transition-colors font-bold text-sm md:text-base cursor-pointer"
            >
              <span>더보기</span>
              <ChevronDown className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>
        )}
      </section>

      {/* ──────────────────────────────────────────────────────────
          Section 3: Bottom (Action)
          ────────────────────────────────────────────────────────── */}
      <section className="mt-16 pt-10 border-t border-gray-100 flex flex-col items-center gap-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full md:w-auto">
          {isActive ? (
            <div className="w-full md:w-[400px] flex justify-center">
              <ApplicationModal programId={programId} programTitle={program.title} />
            </div>
          ) : (
            <button disabled className="w-full md:w-[400px] px-16 py-5 rounded-full font-bold text-xl transition-colors bg-gray-200 text-gray-500 cursor-not-allowed">
              모집이 마감되었습니다
            </button>
          )}
        </div>
      </section>

    </div>
  );
}

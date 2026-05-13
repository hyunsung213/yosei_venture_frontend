"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, LayoutTemplate, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { postProgram } from "@/api/post";

export default function ProgramCreatePage() {
  const router = useRouter();
  const { role } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState("");



  if (role !== 'super') {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-red-600 font-bold">
        <p>
          관리자 전용 페이지입니다. 메인 네비게이션에서 관리자 모드를
          활성화해주세요.
        </p>
      </div>
    );
  }



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorPrompt("");

    const form = e.currentTarget;
    const formData = new FormData();

    // Text fields
    formData.append("title", (form.elements.namedItem("title") as HTMLInputElement).value);
    const sdInput = (form.elements.namedItem("start_date") as HTMLInputElement).value;
    const edInput = (form.elements.namedItem("end_date") as HTMLInputElement).value;
    formData.append("startDate", sdInput || todayKST);
    formData.append("endDate", edInput || todayKST);
    formData.append("content", (form.elements.namedItem("content") as HTMLTextAreaElement).value);

    const capacityInput = form.elements.namedItem("capacity") as HTMLInputElement;
    if (capacityInput?.value) {
      formData.append("capacity", capacityInput.value);
    }
    
    const linkInput = form.elements.namedItem("link") as HTMLInputElement;
    if (linkInput?.value) {
      formData.append("link", linkInput.value);
    }



    // Poster image (single file)
    const posterInput = form.elements.namedItem("poster") as HTMLInputElement;
    if (posterInput?.files?.[0]) {
      formData.append("poster", posterInput.files[0]);
    }

    // Attachment files (multiple: pdf/hwp/hwpx)
    const filesInput = form.elements.namedItem("files") as HTMLInputElement;
    if (filesInput?.files) {
      Array.from(filesInput.files).forEach((file) => {
        formData.append("files", file);
      });
    }
    const res = await postProgram(formData);

    setIsPending(false);
    if (res.success) {
      window.alert("성공적으로 프로그램이 게시되었습니다!");
      router.push(`/program/${res.data?._id ?? res.data?.id ?? ""}`);
    } else {
      setErrorPrompt(res.message ?? "알 수 없는 오류");
    }
  };

  // Calculate KST Today
  const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-12 md:mt-16">
      <Link
        href="/program/list"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        목록으로 취소
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
          <LayoutTemplate className="w-8 h-8 text-yonsei-blue" />
          <h1 className="text-3xl font-black text-gray-900">
            새 프로그램 공고 작성
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                공고 제목 (필수)
              </label>
              <input
                required
                name="title"
                type="text"
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
                placeholder="2026 WAVE-LAB 신규 모집"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                시작일 (필수)
              </label>
              <input
                required
                name="start_date"
                type="date"
                defaultValue={todayKST}
                className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                종료일 (필수)
              </label>
              <input
                required
                name="end_date"
                type="date"
                className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                신청 인원 (명)
              </label>
              <input
                name="capacity"
                type="number"
                min="1"
                step="1"
                onKeyDown={(e) => {
                  if (e.key === '.' || e.key === '-' || e.key === 'e') e.preventDefault();
                }}
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
                placeholder="인원 수를 자연수로 입력"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                신청 관련 링크
              </label>
              <input
                name="link"
                type="url"
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
                placeholder="https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                포스터 이미지 첨부
              </label>
              <input
                name="poster"
                type="file"
                accept=".jpg, .jpeg, .png"
                className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-2">
                첨부하지 않으면 시스템 기본 텍스처 이미지가 사용됩니다.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                프로그램 파일 첨부{" "}
                <span className="text-gray-400 font-normal">
                  (PDF, HWP, HWPX · 다중 선택 가능)
                </span>
              </label>
              <input
                name="files"
                type="file"
                accept=".pdf,.hwp,.hwpx"
                multiple
                className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-2">
                PDF, HWP, HWPX 파일만 업로드 가능합니다. Ctrl(⌘)을 누르면 다중
                선택됩니다.
              </p>
            </div>
          </div>

          {/* Section: Content Editor */}
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2">
              상세 본문 에디터 (수정 가능)
            </label>
            <textarea
              name="content"
              required
              rows={15}
              className="w-full border border-gray-200 py-4 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow leading-relaxed text-gray-700 resize-y"
              placeholder="프로그램의 배경, 목적, 지원 자격, 신청 방법 등을 구체적으로 기재해주세요..."
            />
          </div>

          {errorPrompt && (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl font-bold border border-red-100">
              [에러] {errorPrompt}
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button
              disabled={isPending}
              type="submit"
              className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isPending ? "저장 중..." : "프로그램 게시하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

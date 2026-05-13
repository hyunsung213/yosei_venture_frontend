"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProgramById } from "@/api/get";
import { putProgramForm } from "@/api/put";
import { ArrowLeft, Save, Edit3, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ProgramEditPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [content, setContent] = useState("");
  const [capacity, setCapacity] = useState("");
  const [link, setLink] = useState("");


  // Fetch existing data
  useEffect(() => {
    if (!programId) return;

    const fetchProgram = async () => {
      setLoading(true);
      try {
        const data = await getProgramById(programId);
        if (data) {
          setTitle(data.title);
          // Convert date to YYYY-MM-DD for input
          if (data.startDate) setStartDate(new Date(data.startDate).toISOString().split('T')[0]);
          if (data.endDate) setEndDate(new Date(data.endDate).toISOString().split('T')[0]);
          setContent(data.content);
          if (data.capacity) setCapacity(data.capacity.toString());
          if (data.link) setLink(data.link);
        }
      } catch (err) {
        console.error("Failed to fetch program:", err);
        setErrorPrompt("기존 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programId]);

  if (role !== 'super') {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-red-600 font-bold">
        <p>관리자 전용 페이지입니다. 관리자 모드를 활성화해주세요.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">기존 공고 정보를 불러오는 중...</p>
      </div>
    );
  }



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorPrompt("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("content", content);
    if (capacity) formData.append("capacity", capacity);
    if (link) formData.append("link", link);
    const form = e.currentTarget;
    const posterInput = form.elements.namedItem("poster") as HTMLInputElement;
    if (posterInput?.files?.[0]) {
      formData.append("poster", posterInput.files[0]);
    }

    const filesInput = form.elements.namedItem("files") as HTMLInputElement;
    if (filesInput?.files) {
      Array.from(filesInput.files).forEach((file) => {
        formData.append("files", file);
      });
    }
    const res = await putProgramForm(programId, formData);

    setIsPending(false);
    if (res.success) {
      window.alert("공고가 성공적으로 수정되었습니다!");
      router.push(`/program/${programId}`);
      router.refresh(); 
    } else {
      setErrorPrompt(res.message ?? "수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-12 md:mt-16">
      <Link
        href={`/program/${programId}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        수정 취소
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
          <Edit3 className="w-8 h-8 text-yonsei-blue" />
          <h1 className="text-3xl font-black text-gray-900">공고 수정하기</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">공고 제목</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">시작일</label>
              <input
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">종료일</label>
              <input
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                type="date"
                className="w-full border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">신청 인원 (명)</label>
              <input
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                type="number"
                min="1"
                step="1"
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
                placeholder="인원 수를 자연수로 입력"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">신청 관련 링크</label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                type="url"
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
                placeholder="https://example.com"
              />
            </div>
            {/* Files (Posters/Files) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">포스터 이미지 (변경 시에만 선택)</label>
              <input name="poster" type="file" accept=".jpg, .jpeg, .png" className="w-full border border-gray-200 py-3 px-4 rounded-xl" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-extrabold text-gray-700 mb-2">첨부 파일 (추가/변경 시에만 선택)</label>
              <input name="files" type="file" accept=".pdf,.hwp,.hwpx" multiple className="w-full border border-gray-200 py-3 px-4 rounded-xl" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2">상세 내역</label>
            <textarea
              required
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-gray-200 py-4 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none leading-relaxed resize-y"
            />
          </div>

          {errorPrompt && (
            <div className="text-red-500 bg-red-50 p-4 rounded-xl font-bold border border-red-100">{errorPrompt}</div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              disabled={isPending}
              type="submit"
              className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-white bg-yonsei-blue hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isPending ? "수정 중..." : "수정 완료하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getNoticeById } from "@/api/get";
import { putNotice } from "@/api/put";
import { ArrowLeft, Save, Edit3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface NoticeEditFormProps {
  noticeId: string;
  type: 'community' | 'wave';
}

export default function NoticeEditForm({ noticeId, type }: NoticeEditFormProps) {
  const router = useRouter();
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (!noticeId) return;

    const fetchNotice = async () => {
      setLoading(true);
      try {
        const data = await getNoticeById(noticeId);
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setIsPinned(data.isPinned || false);
        }
      } catch (err) {
        console.error("Failed to fetch notice:", err);
        setErrorPrompt("기존 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorPrompt("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("isPinned", String(isPinned));

    const form = e.currentTarget;
    const filesInput = form.elements.namedItem("files") as HTMLInputElement;
    if (filesInput?.files) {
      Array.from(filesInput.files).forEach((file) => {
        formData.append("files", file);
      });
    }

    const res = await putNotice(noticeId, formData);

    setIsPending(false);
    if (res.success) {
      window.alert("공지사항이 성공적으로 수정되었습니다!");
      router.push(`/${type}/notice/${noticeId}`);
      router.refresh();
    } else {
      setErrorPrompt(res.message ?? "수정 중 오류가 발생했습니다.");
    }
  };

  if (role !== 'super') {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-red-600 font-bold">
        <p>관리자 전용 페이지입니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">기존 공지 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-12 md:mt-16">
      <Link
        href={`/${type}/notice/${noticeId}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        수정 취소
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-10">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
          <Edit3 className="w-8 h-8 text-yonsei-blue" />
          <h1 className="text-3xl font-black text-gray-900">공지사항 수정하기</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">제목</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full text-lg border border-gray-200 py-3 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow"
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <input
                id="isPinned"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-5 h-5 text-yonsei-blue border-gray-300 rounded focus:ring-yonsei-blue cursor-pointer"
              />
              <label htmlFor="isPinned" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                상단 고정 공지로 설정
              </label>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">본문</label>
              <textarea
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-200 py-4 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none leading-relaxed resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">첨부 파일 (추가/변경 시에만 선택)</label>
              <input 
                name="files" 
                type="file" 
                multiple 
                className="w-full border border-gray-200 py-3 px-4 rounded-xl" 
              />
            </div>
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

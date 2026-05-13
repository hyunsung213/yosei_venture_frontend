"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, FileText, Download } from "lucide-react";
import { getNoticeById } from "@/api/get";
import { Notice } from "@/interface/interface";
import { getImage, getCleanFileName } from "@/utils/imageUtils";
import AdminNoticeEditButton from "@/components/notice/AdminNoticeEditButton";
import AdminNoticeDeleteButton from "@/components/notice/AdminNoticeDeleteButton";

export default function WaveNoticeDetailPage() {
  const params = useParams();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeId) return;

    const fetchNotice = async () => {
      setLoading(true);
      try {
        const result = await getNoticeById(noticeId);
        if (!result) {
          setError("공지사항을 찾을 수 없습니다.");
        } else {
          setNotice(result);
        }
      } catch (err) {
        console.error(err);
        setError("공지사항을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">공지사항을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-red-500">
        <p className="font-bold text-lg">{error ?? "공지사항을 찾을 수 없습니다."}</p>
        <Link href="/wave/notice" className="text-sm text-gray-500 hover:text-yonsei-blue underline transition-colors">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const filesArray = Array.isArray(notice.files) ? notice.files : [notice.files].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-12 md:mt-16 bg-white shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/wave/notice" className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          목록으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          <AdminNoticeEditButton noticeId={noticeId} type="wave" />
          <AdminNoticeDeleteButton noticeId={noticeId} type="wave" />
        </div>
      </div>

      <div className="mb-10 pb-6 border-b border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
          {notice.title}
        </h1>
        <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
          <span>작성일: {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-'}</span>
        </div>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 font-medium leading-relaxed whitespace-pre-wrap mb-16">
        {notice.content}
      </div>

      {filesArray.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-yonsei-blue" />
            첨부파일
          </h3>
          <div className="flex flex-col gap-3">
            {filesArray.map((file, idx) => {
              const isObject = typeof file === 'object' && file !== null;
              const fileUrl = isObject ? (file as any).url : String(file);
              const fileName = isObject ? (file as any).originalName : getCleanFileName(String(file));

              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-yonsei-blue/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-yonsei-blue flex-shrink-0" />
                    <span className="font-bold text-gray-700 truncate">{fileName}</span>
                  </div>
                  <a
                    href={getImage(fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={fileName}
                    className="p-2.5 bg-gray-50 text-gray-500 hover:bg-yonsei-blue hover:text-white rounded-lg transition-all flex items-center gap-2 text-xs font-black flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

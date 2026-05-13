'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { getNewsById } from "@/api/get";
import { News } from "@/interface/interface";
import { getImage } from "@/utils/imageUtils";

export default function NewsDetailPage() {
  const params = useParams();
  const newsId = params.id as string;

  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!newsId) return;

    const fetchNews = async () => {
      setLoading(true);
      try {
        const result = await getNewsById(newsId);
        if (!result) {
          setError("뉴스를 찾을 수 없습니다.");
        } else {
          setNews(result);
        }
      } catch (err) {
        console.error(err);
        setError("뉴스를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">기사를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-red-500">
        <p className="font-bold text-lg">{error ?? "기사를 찾을 수 없습니다."}</p>
        <Link href="/community/news" className="text-sm text-gray-500 hover:text-yonsei-blue underline transition-colors">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // Parse imgs if it's a JSON string array or standard array
  let imageUrl = "";
  if (news.img) {
      imageUrl = getImage(news.img);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-12 md:mt-16 bg-white shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-8">
        <Link href="/community/news" className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          목록으로 돌아가기
        </Link>
      </div>

      <article className="pb-10">
        <header className="mb-10 pb-6 border-b border-gray-100 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 leading-snug">
            {news.title}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold text-gray-400">
            <span>{news.createdAt ? new Date(news.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </header>

        {imageUrl && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-sm bg-gray-50">
            <img 
              src={imageUrl} 
              alt={news.title} 
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-800 font-medium leading-relaxed whitespace-pre-wrap mb-16 px-2 md:px-0">
          {news.content}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 bg-gray-50 hover:bg-yonsei-blue text-gray-600 hover:text-white rounded-xl font-bold transition-colors shadow-sm group"
          >
            원본 기사 보러가기
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </a>
        </div>
      </article>
    </div>
  );
}

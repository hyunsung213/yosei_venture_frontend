'use client';

import { FileText, PlusCircle, X, Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { getAllNews } from '@/api/get';
import { postNews } from '@/api/post';
import { INews, News } from '@/interface/interface';
import { getImage } from '@/utils/imageUtils';

export default function PressPage() {
  const { role } = useAuth();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [imgs, setImgs] = useState<FileList | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAllNews();
        setNewsList(data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
       alert("제목을 입력해주세요.");
       return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("url", url);
    if (imgs) {
      Array.from(imgs).forEach(file => {
        formData.append("imgs", file);
      });
    }

    const res = await postNews(formData);
    setIsPending(false);

    if (res.success) {
      alert("뉴스가 성공적으로 등록되었습니다.");
      setIsModalOpen(false);
      window.location.reload();
    } else {
      alert(res.message || "등록 실패");
    }
  };

  return (
    <div className="w-full">
      {role === "super" && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            언론보도 생성
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-black text-gray-900">새 언론보도(뉴스) 생성</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition" 
                  placeholder="뉴스 제목 입력" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">본문(요약)</label>
                <textarea 
                  rows={5} 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition resize-none" 
                  placeholder="뉴스 요약 내용을 입력하세요..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">뉴스 이미지</label>
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  onChange={(e) => setImgs(e.target.files)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">출처 (URL)</label>
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition" 
                  placeholder="https://" 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition"
              >
                취소
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isPending}
                className="px-5 py-2.5 rounded-lg bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
            <p className="font-bold">뉴스를 불러오는 중...</p>
          </div>
        ) : newsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((news) => (
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                key={news.id} 
                className="group flex flex-col border border-gray-100 hover:border-blue-200 bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-300 relative overflow-hidden">
                   {news.imgs && news.imgs.length > 0 ? (
                      <img 
                        src={getImage(news.imgs[0])} 
                        alt={news.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                      />
                   ) : (
                      <FileText className="w-12 h-12 transform group-hover:scale-110 transition-transform duration-500" />
                   )}
                   <div className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-yonsei-blue" />
                   </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-xs font-bold text-gray-400 mb-3">
                    {news.createdAt ? new Date(news.createdAt).toLocaleDateString() : ''}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-3 group-hover:text-yonsei-blue transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {news.content}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400 font-bold">
            등록된 뉴스가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

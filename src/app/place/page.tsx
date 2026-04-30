'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Loader2, ServerOff } from 'lucide-react';
import { getAllPlaces } from '@/api/get';
import { Place } from '@/interface/interface';

export default function PlaceListingPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      try {
        const data = await getAllPlaces() || [];
        setPlaces(data);
      } catch (e) {
        console.error("Place 목록 로드 실패:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">창업 공간 대관</h1>
          <p className="mt-4 text-lg text-gray-500 font-medium">연세대학교 체계적인 창업 인프라를 경험해보세요.</p>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
            <p className="font-bold">공간 목록을 불러오는 중...</p>
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <ServerOff className="w-10 h-10" />
            <p className="font-bold">데이터를 불러오는 데 실패했습니다.</p>
            <p className="text-sm">잠시 후 다시 시도하거나 관리자에게 문의해주세요.</p>
          </div>
        )}

        {/* 빈 결과 */}
        {!loading && !error && places.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <MapPin className="w-10 h-10" />
            <p className="font-bold">등록된 공간이 없습니다.</p>
          </div>
        )}

        {/* 목록 */}
        {!loading && !error && places.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place, index) => {
              const placeId = place.id ?? (place as any).id ?? String(index);

              return (
                <Link
                  key={placeId}
                  href={`/place/${placeId}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                    <Image
                      src={place.imgs[0] || "/image/yonsei_logo.png"}
                      alt={place.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-yonsei-blue transition-colors mb-3">
                      {place.name}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {place.describe}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-yonsei-blue bg-blue-50 px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5" />
                        연세대학교 미래캠퍼스
                      </div>
                      <span className="text-sm font-bold text-gray-400 group-hover:text-yonsei-blue transition-colors">예약하기 &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, Loader2, ServerOff } from 'lucide-react';
import { Place } from '@/interface/interface';
import { getImage } from '@/utils/imageUtils';
import { getAllPlaces } from '@/api/get';

export default function FacilityPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true);
      try {
        const res = await getAllPlaces();
        setPlaces(res || []);
      } catch (e) {
        console.error("시설현황 로드 실패:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  return (
    <div className="w-full">
      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
          <p className="font-bold">시설 정보를 불러오는 중...</p>
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
          <ServerOff className="w-10 h-10" />
          <p className="font-bold">데이터를 불러오는 데 실패했습니다.</p>
        </div>
      )}

      {/* 목록 */}
      {!loading && !error && places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {places.map((place, index) => {
            const placeId = place._id ?? (place as any).id ?? String(index);
            
            const imageUrl = (place as any).image ?? (place.img?.length > 0 ? place.img : null);
            const viewImage = imageUrl ? getImage(imageUrl) : '/image/yonsei_logo.png';

            return (
              <div
                key={placeId}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                  <Image
                    src={viewImage}
                    alt={place.name}
                    fill
                    unoptimized
                    className={`object-cover transition-transform duration-700 group-hover:scale-105 ${!imageUrl ? 'opacity-30 blur-[1px] object-contain p-8' : ''}`}
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow text-center">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight mb-3">
                    {place.name}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">
                    {place.describe}
                  </p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                      <MapPin className="w-3.5 h-3.5" />
                      위치 참고용 정보 제공
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

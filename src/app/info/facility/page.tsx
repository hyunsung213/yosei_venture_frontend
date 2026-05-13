'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, Loader2, ServerOff } from 'lucide-react';
import { Place } from '@/interface/interface';
import { getImage } from '@/utils/imageUtils';
import { getAllPlaces } from '@/api/get';
import { postPlace } from '@/api/post';
import { putPlace } from '@/api/put';
import { deletePlace } from '@/api/delete';
import { useAuth } from '@/contexts/AuthContext';
import PlaceModal from '@/components/admin/PlaceModal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function FacilityPage() {
  const { role } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAdd = () => {
    setEditingPlace(null);
    setIsModalOpen(true);
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setIsModalOpen(true);
  };

  const handleDelete = async (placeId: string) => {
    if (!window.confirm("정말로 이 시설을 삭제하시겠습니까?")) return;
    try {
      const res = await deletePlace(placeId);
      if (res.success) {
        setPlaces(places.filter(p => p.id !== placeId));
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (editingPlace) {
        const res = await putPlace(editingPlace.id, formData);
        if (res.success) {
          // Refetch to get updated image urls
          const updatedPlaces = await getAllPlaces();
          setPlaces(updatedPlaces || []);
          setIsModalOpen(false);
        } else {
          alert(res.message);
        }
      } else {
        const res = await postPlace(formData);
        if (res.success) {
          const updatedPlaces = await getAllPlaces();
          setPlaces(updatedPlaces || []);
          setIsModalOpen(false);
        } else {
          alert(res.message);
        }
      }
    } catch (error) {
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Admin Controls */}
      {role === 'super' && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-yonsei-blue text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            시설 추가하기
          </button>
        </div>
      )}
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
            const placeId = place.id;
            
            const imageUrl = place.imgs[0];
            const viewImage = imageUrl ? getImage(imageUrl) : '/image/yonsei_logo.png';

            return (
              <div
                key={placeId}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
              >
                {role === 'super' && (
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.preventDefault(); handleEdit(place); }}
                      className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm backdrop-blur-sm border border-gray-200 transition"
                      title="수정"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(placeId); }}
                      className="p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm backdrop-blur-sm border border-red-100 transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
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

      <PlaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingPlace}
        isLoading={isSubmitting}
      />
    </div>
  );
}

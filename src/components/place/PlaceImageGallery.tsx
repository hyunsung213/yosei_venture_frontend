'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Grip, X } from 'lucide-react';

export default function PlaceImageGallery({ placeName, imageSrc }: { placeName: string, imageSrc: string }) {
  const [showModal, setShowModal] = useState(false);

  // We only have 1 image per dummy_data, repeat it to simulate a realistic gallery.
  const galleryImages = [
    imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc, imageSrc
  ];

  return (
    <>
      <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden mb-12 flex gap-2">
         {/* Left Hero (50%) */}
         <div className="relative w-full md:w-1/2 h-full bg-gray-200" onClick={() => setShowModal(true)}>
           <Image src={imageSrc} alt={placeName} fill className="object-cover hover:brightness-110 transition-all cursor-pointer" />
         </div>
         
         {/* Right 2x2 Grid (50%) */}
         <div className="w-1/2 h-full hidden md:grid grid-cols-2 grid-rows-2 gap-2" onClick={() => setShowModal(true)}>
           <div className="relative w-full h-full bg-gray-200">
              <Image src={imageSrc} alt="sub 1" fill className="object-cover object-bottom hover:brightness-110 transition-all cursor-pointer" />
           </div>
           <div className="relative w-full h-full bg-gray-200">
              <Image src={imageSrc} alt="sub 2" fill className="object-cover object-top hover:brightness-110 transition-all cursor-pointer" />
           </div>
           <div className="relative w-full h-full bg-gray-200">
              <Image src={imageSrc} alt="sub 3" fill className="object-cover object-left hover:brightness-110 transition-all cursor-pointer" />
           </div>
           <div className="relative w-full h-full bg-gray-200">
              <Image src={imageSrc} alt="sub 4" fill className="object-cover object-right hover:brightness-110 transition-all cursor-pointer" />
           </div>
         </div>
         
         {/* Float View All Button */}
         <button 
           onClick={() => setShowModal(true)}
           className="absolute bottom-6 right-6 bg-white border border-gray-900 shadow-md px-4 py-2 rounded-lg font-bold text-sm text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors z-10 hidden md:flex"
         >
           <Grip className="w-4 h-4" />
           사진 모두 보기
         </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-200">
           {/* Modal Header */}
           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-900" />
              </button>
              <h2 className="text-xl font-black text-gray-900 truncate">사진 갤러리</h2>
              <div className="w-10"></div> {/* Spacer to center title */}
           </div>
           
           {/* Modal Body */}
           <div className="overflow-y-auto flex-1 bg-white p-4 md:p-8">
              <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
                 {galleryImages.map((src, i) => (
                    <div key={i} className="w-full relative bg-gray-100 rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: i % 3 === 0 ? '16/9' : '4/3' }}>
                       <Image src={src} fill alt={`Gallery ${i+1}`} className="object-cover" />
                    </div>
                 ))}
                 
                 <div className="text-center py-10">
                    <p className="text-gray-400 font-bold">더 이상 표시할 이미지가 없습니다.</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

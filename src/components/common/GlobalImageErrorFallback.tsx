'use client';

import { useEffect } from 'react';

export default function GlobalImageErrorFallback() {
  useEffect(() => {
    const handleImageError = (e: Event) => {
      const target = e.target as HTMLImageElement;
      if (target && target.tagName && target.tagName.toLowerCase() === 'img') {
        // 방어 로직: 이미 대체 이미지인 경우 무한루프 방지
        if (target.src.includes('yonsei_logo_black.png')) {
          return;
        }
        
        target.src = '/image/yonsei_logo_black.png';
        target.style.opacity = '0.2'; // 흐리게 (원하는 투명도로 조정 가능)
        target.style.objectFit = 'contain';
        target.style.padding = '1rem'; // 너무 꽉 차 보이지 않도록 패딩 추가
      }
    };

    // true를 주어 캡처 페이즈에서 리소스 로딩 에러(img 태그 에러 포함)를 가로챔
    window.addEventListener('error', handleImageError, true);

    return () => {
      window.removeEventListener('error', handleImageError, true);
    };
  }, []);

  return null;
}

import Link from "next/link";
// Removed lucide-react social icons to fix build error.

export default function Footer() {
  const partners = [
    "중소벤처기업부",
    "강원창조경제혁신센터",
    "연세대학교",
    "창업진흥원",
    "중소벤처기업진흥공단",
  ];

  return (
    <footer className="bg-[#1a1f2c] text-white pt-16 pb-8 border-t-4 border-yonsei-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section: Info and Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Contact Info */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-gold mb-4">연세대학교 미래캠퍼스 창업지원단</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📍 26493 강원특별자치도 원주시 연세대길 1</p>
              <p>📞 연락처: +82-33-760-0000</p>
              <p>✉️ 이메일: startup@yonsei.ac.kr</p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-6 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">YouTube</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-lg font-semibold mb-4 text-gray-100">빠른 메뉴</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#about" className="hover:text-gold transition-colors">센터 소개</Link></li>
              <li><Link href="#education" className="hover:text-gold transition-colors">창업 로드맵</Link></li>
              <li><Link href="#space" className="hover:text-gold transition-colors">공간 대관</Link></li>
              <li><Link href="#community" className="hover:text-gold transition-colors">공지사항</Link></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-lg font-semibold mb-4 text-gray-100">상담 및 운영 시간</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>평일: 09:00 ~ 17:00</p>
              <p>점심시간: 12:00 ~ 13:00</p>
              <p>주말 및 공휴일 휴무</p>
            </div>
          </div>
        </div>

        {/* Partners Marquee */}
        <div className="border-t border-gray-700 pt-8 pb-8">
          <p className="text-sm text-gray-400 mb-4 text-center">협력 기관</p>
          <div className="relative flex overflow-x-hidden">
            <div className="py-2 animate-marquee whitespace-nowrap flex items-center space-x-8">
              {[...partners, ...partners, ...partners, ...partners].map((partner, index) => (
                <span key={index} className="text-gray-500 font-medium text-lg px-4 uppercase tracking-wider">
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 pt-8 border-t border-gray-800">
          <p>&copy; {new Date().getFullYear()} 연세대학교 미래캠퍼스 창업지원단. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
}

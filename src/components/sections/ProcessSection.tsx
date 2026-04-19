'use client';

import { BookOpen, Users, Building2, Globe } from "lucide-react";

export default function ProcessSection() {
  const steps = [
    {
      id: "01",
      title: "창업교육",
      desc: "아이디어 검증, 비즈니스 모델링, 기술 사업화를 아우르는 실무 중심 교육과정.",
      icon: BookOpen,
      color: "bg-blue-50 text-yonsei-blue",
    },
    {
      id: "02",
      title: "멘토링",
      desc: "창업 선배 및 각 분야 최고 전문가들의 1:1 맞춤형 전담 멘토링 지원.",
      icon: Users,
      color: "bg-blue-50 text-yonsei-blue",
    },
    {
      id: "03",
      title: "공간 및 보육",
      desc: "시제품 제작 및 협업을 위한 최첨단 코워킹 스페이스 및 메이커 스페이스 제공.",
      icon: Building2,
      color: "bg-yellow-50 text-gold",
    },
    {
      id: "04",
      title: "글로벌 스케일업",
      desc: "글로벌 파트너 및 VC 연계를 통한 성공적인 해외 시장 진출 지원.",
      icon: Globe,
      color: "bg-blue-50 text-yonsei-blue",
    },
  ];

  return (
    <section id="education" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-gold uppercase tracking-widest mb-2">성공을 위한 로드맵</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 break-keep">
            핵심 창업 <span className="text-yonsei-blue">프로세스</span>
          </h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto break-keep">
            초기 아이디어부터 글로벌 비즈니스로의 성장을 돕는 체계적인 창업 지원 프로세스를 제공합니다.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Horizontal Line connecting steps (Desktop only) */}
          <div className="hidden lg:block absolute top-[45px] left-0 right-0 h-1 bg-gradient-to-r from-blue-100 via-yonsei-blue/30 to-blue-100 z-0 border-t border-dashed border-yonsei-blue/50"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-yonsei-blue text-white rounded-lg flex items-center justify-center font-black shadow-lg">
                    {step.id}
                  </div>

                  {/* Step Icon */}
                  <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10" />
                  </div>

                  {/* Content */}
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed break-keep">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Users, FolderOpen, LineChart, Target, Rocket, Lightbulb, ArrowRight, ArrowDown } from 'lucide-react';
import Link from 'next/link';

const IconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-8 h-8 md:w-10 md:h-10 text-yonsei-blue" />,
  Users: <Users className="w-8 h-8 md:w-10 md:h-10 text-yonsei-blue" />,
  FolderOpen: <FolderOpen className="w-8 h-8 md:w-10 md:h-10 text-yonsei-blue" />,
  LineChart: <LineChart className="w-8 h-8 md:w-10 md:h-10 text-yonsei-blue" />
};

export default function WaveAboutPage() {
  const { role } = useAuth();
  const [data, setData] = useState<{ roadmap: any[]; infrastructure: any[] } | null>(null);

  useEffect(() => {
    fetch('/dummy/wave_about.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err));
  }, []);

  const isMember = role !== 'guest';

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-pulse flex flex-col items-center gap-4 text-gray-400 font-bold">
          <Rocket className="w-10 h-10" />
          <p>로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-14 mb-8 overflow-hidden">
      {/* 2.1 Hero Section */}
      <section className="relative w-full bg-yonsei-blue rounded-3xl text-white overflow-hidden py-16 md:py-24 mb-16 shadow-inner">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-full object-cover">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L48,165.3C96,171,192,181,288,181.3C384,181,480,171,576,144C672,117,768,75,864,80C960,85,1056,139,1152,165.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 font-bold text-sm tracking-wider mb-6 backdrop-blur-sm border border-white/30">
              WAVE KANGWON INNOVATION PLATFORM
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-tight break-keep">
              강원권 창업체험교육의 파도, <br className="hidden md:block"/> WAVE 혁신 플랫폼
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed break-keep">
              아이디어 발굴부터 시리즈 투자까지, 지역 정주와 창업 활성화를 잇는 통합 창업 지원 생태계입니다.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="space-y-20 md:space-y-32">
        
        {/* 2.2 Core Value */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">사업의 핵심 가치</h2>
            <div className="w-16 h-1.5 bg-yonsei-blue mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                 <Target className="w-7 h-7 text-yonsei-blue" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">실전 중심</h3>
              <p className="text-gray-500 leading-relaxed font-medium break-keep">
                단순 교육을 넘어선 실전 창업 체험 및 프로토타입 시제품 개발을 강력하게 지원합니다.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                 <Rocket className="w-7 h-7 text-yonsei-blue" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">성장 가속</h3>
              <p className="text-gray-500 leading-relaxed font-medium break-keep">
                아이디어 검증 단계부터 IR 피칭 및 벤처 투자 유치까지 이어지는 전주기 특화 케어를 제공합니다.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                 <Lightbulb className="w-7 h-7 text-yonsei-blue" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">지역 혁신</h3>
              <p className="text-gray-500 leading-relaxed font-medium break-keep">
                강원 지역의 핵심 인재를 발굴하고 창업 생태계 활성화를 통한 혁신적인 지역 정주를 도모합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 2.3 Roadmap UI (Framer Motion Staggered) */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">단계별 성장 로드맵</h2>
            <div className="w-16 h-1.5 bg-yonsei-blue mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 font-medium text-gray-500 max-w-2xl mx-auto">
              초기 아이디어 구상부터 성공적인 투자 유치까지, <br className="md:hidden"/> WAVE 플랫폼은 여러분의 흔들림 없는 파트너가 됩니다.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 relative"
          >
            {data.roadmap.map((step, idx) => (
              <React.Fragment key={idx}>
                <motion.div variants={itemVariants} className="w-full md:w-1/3 flex flex-col relative z-20">
                  <div className="bg-white rounded-2xl p-8 border-2 border-transparent hover:border-yonsei-blue transition-colors shadow-lg shadow-gray-200/50 flex flex-col h-full items-center text-center">
                    <span className="text-sm font-black text-white bg-yonsei-blue px-3 py-1 rounded-full mb-4 tracking-wider">STEP 0{idx + 1}</span>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{step.step}</h3>
                    <h4 className="text-lg font-bold text-gray-700 mb-4 pb-4 border-b border-gray-100 w-full">{step.title}</h4>
                    <p className="text-gray-500 font-medium leading-relaxed break-keep">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow between elements */}
                {idx < data.roadmap.length - 1 && (
                  <motion.div variants={itemVariants} className="flex items-center justify-center py-2 md:py-0 relative z-10 text-gray-300">
                    <ArrowDown className="w-8 h-8 block md:hidden" />
                    <ArrowRight className="w-8 h-8 hidden md:block" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </section>

        {/* 2.4 Infrastructure Grid */}
        <section>
          <div className="bg-blue-900 rounded-3xl p-8 md:p-14 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-yonsei-blue rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10 text-center mb-12">
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">주요 제공 인프라</h2>
              <p className="text-blue-100 font-medium opacity-90 max-w-xl mx-auto break-keep">
                성공적인 비즈니스 안착을 돕기 위해 WAVE 플랫폼에서 전폭적으로 지원하는 핵심 인프라입니다.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              {data.infrastructure.map((infra, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col items-center text-center border border-white/20 transition-transform transform hover:-translate-y-1">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-lg">
                    {IconMap[infra.icon] || <Target className="w-8 h-8 text-yonsei-blue" />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{infra.title}</h3>
                  <p className="text-blue-50 text-sm md:text-base leading-relaxed font-medium break-keep mb-6">
                    {infra.description}
                  </p>
                  
                  {/* Auth conditional logic for booking button */}
                  {infra.icon === "Building2" && (
                    <div className="mt-auto w-full">
                      {isMember ? (
                        <Link href="/place" className="inline-block w-full text-center bg-white text-yonsei-blue font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                          공간 예약하기
                        </Link>
                      ) : (
                        <button className="w-full text-center bg-gray-500/50 text-gray-200 font-bold px-6 py-3 rounded-xl cursor-not-allowed text-sm">
                          회원 로그인 후 예약 가능
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

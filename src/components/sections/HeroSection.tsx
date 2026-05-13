'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const particles = [
    { text: "도전", x: 20, y: 30, delay: 0 },
    { text: "성장", x: 70, y: 20, delay: 0.2 },
    { text: "글로벌", x: 80, y: 70, delay: 0.4 },
    { text: "혁신", x: 15, y: 65, delay: 0.6 },
  ];

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {/* Placeholder Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full scale-105"
        >
          <source 
            src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4" 
            type="video/mp4" 
          />
        </video>
        
        {/* Yonsei Blue Gradient Overlay (40% opacity approx) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yonsei-blue/80 via-yonsei-blue/50 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-yonsei-blue/30" />
      </div>

      {/* Floating Particles */}
      {particles.map((particle, idx) => (
        <motion.div
          key={idx}
          className="absolute z-10 text-white/30 font-bold text-5xl md:text-8xl tracking-tighter mix-blend-overlay pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 0.8,
            scale: 1,
            x: mousePosition.x * (idx % 2 === 0 ? -40 : 40),
            y: mousePosition.y * (idx % 2 === 0 ? 40 : -40),
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 30,
            mass: 2,
          }}
          style={{ top: `${particle.y}%`, left: `${particle.x}%` }}
        >
          {particle.text}
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-gold/20 text-gold border border-gold/40 text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
            연세대학교 미래캠퍼스
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 break-keep">
            미래를 디자인하다 <br className="hidden md:block"/>
            <span className="text-gold">스타트업 혁신의 중심</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-light break-keep">
            연세대학교 미래캠퍼스 창업지원단은 학생, 교원, 그리고 예비 창업가들이 세상을 바꿀 혁신을 만들어갈 수 있도록 지원합니다.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-[30px] h-[50px] border-2 border-white/50 rounded-full flex justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
}

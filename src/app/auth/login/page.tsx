'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, User, Phone, Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import apiClient from '@/api/axiosConfig';
import { useAuth } from '@/contexts/AuthContext';
import { ILogin, IUser, RoleType } from '@/interface/interface';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { postLogin, postRegister } from '@/api/login';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, userId, login } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regPwdConfirm, setRegPwdConfirm] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [regStudentId, setRegStudentId] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (role !== 'guest') {
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
    }
  }, [role, router, searchParams]);

  // --- Normalization Helpers ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      val = `${val.slice(0, 3)}-${val.slice(3)}`;
    } else if (val.length > 7) {
      val = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
    }
    setRegPhone(val);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // --- Actions ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginPwd) {
      setErrorMsg('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const loginData: ILogin = {
      email: loginEmail,
      pwd: loginPwd
    }
    
    setIsLoading(true);
    try {
      const response = await postLogin(loginData);
      const { token, type } = response.data;
      const userId = response.data.userId || response.data._id || response.data.user?._id;
      login(token, type, userId);
      } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!regName || !regPhone || !regEmail || !regPwd || !regPwdConfirm) {
      setErrorMsg('모든 항목을 입력해주세요.');
      return;
    }
    if (isStudent && !regStudentId) {
      setErrorMsg('학번을 입력해주세요.');
      return;
    }
    if (!validateEmail(regEmail)) {
      setErrorMsg('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (regPwd !== regPwdConfirm) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    const regData: IUser = {
      name: regName,
      phone: regPhone,
      email: regEmail,
      pwd: regPwd,
      isSocial: false,
      isStudent: isStudent,
      studentId: regStudentId,
      type: 'general',
    }

    setIsLoading(true);
    try {
    postRegister(regData);
    setMode('login');
    setLoginEmail(regEmail);
    setLoginPwd('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (role !== 'guest') return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 pt-24 pb-20 relative overflow-hidden flex flex-col items-center">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[540px] z-10">
        {/* Main Unitary Card */}
        <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,56,118,0.05)] border border-gray-100 overflow-hidden">
          
          {/* Logo Section */}
          <div className="pt-12 pb-6 text-center">
            <Link href="/" className="inline-flex flex-col items-center gap-2 active:scale-95 transition-transform">
               <div className="w-16 h-16 relative">
                 <Image src="/image/yonsei_logo.png" alt="Logo" fill className="object-contain" />
               </div>
               <div className="text-center">
                 <h1 className="text-xl font-black text-yonsei-blue tracking-tight leading-none mb-1 uppercase">YONSEI VENTURE</h1>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Innovation & Entrepreneurship</p>
               </div>
            </Link>
          </div>

          {/* Mode Switcher */}
          <div className="px-8 md:px-12">
            <div className="flex p-1.5 bg-gray-50 border border-gray-100 rounded-2xl">
              <button 
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'login' ? 'bg-white text-yonsei-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                로그인
              </button>
              <button 
                onClick={() => { setMode('register'); setErrorMsg(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'register' ? 'bg-white text-yonsei-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                회원가입
              </button>
            </div>
          </div>

          <div className="px-8 md:px-12 pb-12 pt-10">
            <div className="mb-8 overflow-hidden">
              <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                {mode === 'login' ? '다시 만나서 반가워요!' : '함께 시작해볼까요?'}
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {mode === 'login' ? '이메일과 비밀번호를 입력하여 로그인을 완료해주세요.' : '회원가입을 통해 연세대학교 창업지원단의 서비스를 이용하세요.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">이메일</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-yonsei-blue transition-colors" />
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="example@yonsei.ac.kr" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider">비밀번호</label>
                    <button type="button" className="text-xs font-bold text-gray-300 hover:text-yonsei-blue transition-colors">잊어버리셨나요?</button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-yonsei-blue transition-colors" />
                    <input 
                      type="password"
                      value={loginPwd}
                      onChange={(e) => setLoginPwd(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-yonsei-blue hover:bg-blue-800 text-white font-black py-4 rounded-[20px] transition duration-300 shadow-lg shadow-yonsei-blue/20 flex justify-center items-center gap-2 disabled:opacity-70 mt-4 active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      로그인하기
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">성함</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          type="text" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="실명" 
                          className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                        />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">연락처</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          type="text" 
                          value={regPhone}
                          onChange={handlePhoneChange}
                          placeholder="010-0000-0000" 
                          maxLength={13}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                        />
                      </div>
                   </div>
                </div>
                
                {/* 학생/외부인 토글 */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">구분</label>
                  <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => setIsStudent(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isStudent ? 'bg-white text-yonsei-blue shadow-sm border border-gray-100' : 'text-gray-400'}`}
                    >
                      학생
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsStudent(false); setRegStudentId(''); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isStudent ? 'bg-white text-yonsei-blue shadow-sm border border-gray-100' : 'text-gray-400'}`}
                    >
                      외부인 
                    </button>
                  </div>
                </div>

                {/* 학번 입력칸 */}
                <div className={`space-y-1.5 transition-all duration-300 ${!isStudent ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">학번</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text" 
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="학번 10자리" 
                      disabled={!isStudent}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="example@yonsei.ac.kr" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="password" 
                        value={regPwd}
                        onChange={(e) => setRegPwd(e.target.value)}
                        placeholder="••••" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">비밀번호 확인</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="password" 
                        value={regPwdConfirm}
                        onChange={(e) => setRegPwdConfirm(e.target.value)}
                        placeholder="••••" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-yonsei-blue hover:bg-blue-800 text-white font-black py-4 rounded-[20px] transition duration-300 shadow-lg shadow-yonsei-blue/20 flex justify-center items-center gap-2 disabled:opacity-70 mt-2 active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '계정 생성하기'}
                </button>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-gray-50 text-center">
               <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-yonsei-blue transition-colors">
                 <ArrowLeft className="w-4 h-4" />
                 메인 페이지로 돌아가기
               </Link>
            </div>
          </div>
        </div>

        {/* Footer Info - Outside the main card for better balance but still centered */}
        <p className="mt-8 text-center text-[11px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
          © 2026 연세대학교 미래캠퍼스 창업지원단.<br />
          INNOVATION & ENTREPRENEURSHIP CENTER
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

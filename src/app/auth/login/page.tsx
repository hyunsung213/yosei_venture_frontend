'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Mail, Lock, User, Phone, Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import apiClient from '@/api/axiosConfig';
import { useAuth } from '@/contexts/AuthContext';
import { ILogin, IUser, RoleType } from '@/interface/interface';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { postLogin, postRegister, postFindEmail, postForgotPassword } from '@/api/login';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, userId, login } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'find-email' | 'forgot-password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [foundEmail, setFoundEmail] = useState('');

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

  const isEmailValid = !regEmail || validateEmail(regEmail);
  const isPhoneValid = !regPhone || /^010-\d{4}-\d{4}$/.test(regPhone);
  const isStudentIdValid = !isStudent || !regStudentId || regStudentId.length > 0;

  const pwdLengthValid = regPwd.length >= 8;
  const hasUpper = /[A-Z]/.test(regPwd);
  const hasLower = /[a-z]/.test(regPwd);
  const hasNumber = /[0-9]/.test(regPwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(regPwd);
  const typesCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isPwdTypesValid = typesCount >= 3;
  const isPwdConfirmValid = !regPwdConfirm || regPwd === regPwdConfirm;

  // --- Actions ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
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
      const { token, refreshToken, type } = response.data;
      const userId = response.data.userId || response.data._id || response.data.user?._id;
      login(token, refreshToken, type, userId);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 423) {
        setErrorMsg(err.response?.data?.message || '로그인 실패 5회로 계정이 잠겼습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setErrorMsg(err.response?.data?.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});
    
    if (!regName || !regPhone || !regEmail || !regPwd || !regPwdConfirm) {
      setErrorMsg('모든 항목을 입력해주세요.');
      return;
    }
    if (isStudent && !regStudentId) {
      setErrorMsg('학번 또는 교번을 입력해주세요.');
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
      await postRegister(regData);
      setSuccessMsg('회원가입이 완료되었습니다. 로그인해주세요.');
      setMode('login');
      setLoginEmail(regEmail);
      setLoginPwd('');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 400 && Array.isArray(err.response?.data?.errors)) {
        setErrorMsg('입력하신 정보에 오류가 있습니다.');
        const newFieldErrors: Record<string, string> = {};
        err.response.data.errors.forEach((errMsg: string) => {
          const lowerMsg = errMsg.toLowerCase();
          if (lowerMsg.includes('email') || lowerMsg.includes('이메일')) newFieldErrors.email = errMsg;
          else if (lowerMsg.includes('phone') || lowerMsg.includes('전화번호') || lowerMsg.includes('연락처')) newFieldErrors.phone = errMsg;
          else if (lowerMsg.includes('student') || lowerMsg.includes('학번') || lowerMsg.includes('교번')) newFieldErrors.studentId = errMsg;
          else if (lowerMsg.includes('name') || lowerMsg.includes('이름')) newFieldErrors.name = errMsg;
          else if (lowerMsg.includes('password') || lowerMsg.includes('비밀번호')) newFieldErrors.pwd = errMsg;
          else newFieldErrors.general = errMsg;
        });
        setFieldErrors(newFieldErrors);
      } else if (err.response?.status === 409) {
        const errMsg = err.response?.data?.message || '가입에 실패했습니다.';
        setErrorMsg('가입에 실패했습니다.');
        const newFieldErrors: Record<string, string> = {};
        const lowerMsg = errMsg.toLowerCase();
        if (lowerMsg.includes('email') || lowerMsg.includes('이메일')) newFieldErrors.email = errMsg;
        else if (lowerMsg.includes('phone') || lowerMsg.includes('전화번호') || lowerMsg.includes('연락처')) newFieldErrors.phone = errMsg;
        else if (lowerMsg.includes('student') || lowerMsg.includes('학번') || lowerMsg.includes('교번')) newFieldErrors.studentId = errMsg;
        else newFieldErrors.general = errMsg;
        setFieldErrors(newFieldErrors);
      } else {
        setErrorMsg(err.response?.data?.message || '회원가입에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFoundEmail('');
    
    if (!regName || !regPhone) {
      setErrorMsg('이름과 연락처를 모두 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await postFindEmail({ name: regName, phone: regPhone });
      setFoundEmail(response.data.emailMasked);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || '일치하는 회원 정보를 찾을 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!loginEmail) {
      setErrorMsg('이메일을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      await postForgotPassword({ email: loginEmail });
      setSuccessMsg('이메일로 재설정 링크가 전송되었습니다. 이메일함을 확인해주세요.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || '비밀번호 재설정 링크 전송에 실패했습니다.');
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
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); setFieldErrors({}); setFoundEmail(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'login' ? 'bg-white text-yonsei-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                로그인
              </button>
              <button 
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); setFieldErrors({}); setFoundEmail(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'register' ? 'bg-white text-yonsei-blue shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                회원가입
              </button>
            </div>
          </div>

          <div className="px-8 md:px-12 pb-12 pt-10">
            <div className="mb-8 overflow-hidden">
              <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                {mode === 'login' && '다시 만나서 반가워요!'}
                {mode === 'register' && '함께 시작해볼까요?'}
                {mode === 'find-email' && '가입하신 이메일이 기억나지 않으신가요?'}
                {mode === 'forgot-password' && '비밀번호를 잊어버리셨나요?'}
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {mode === 'login' && '이메일과 비밀번호를 입력하여 로그인을 완료해주세요.'}
                {mode === 'register' && '회원가입을 통해 연세대학교 창업지원단의 서비스를 이용하세요.'}
                {mode === 'find-email' && '이름과 연락처를 통해 가입된 이메일을 확인합니다.'}
                {mode === 'forgot-password' && '가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {errorMsg}
                </div>

              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {successMsg}
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
                
                <div className="flex justify-between items-center px-1 pt-1 pb-2">
                  <button type="button" onClick={() => { setMode('find-email'); setErrorMsg(''); setSuccessMsg(''); setFieldErrors({}); setFoundEmail(''); }} className="text-xs font-bold text-gray-400 hover:text-yonsei-blue transition-colors">이메일 찾기</button>
                  <button type="button" onClick={() => { setMode('forgot-password'); setErrorMsg(''); setSuccessMsg(''); setFieldErrors({}); setFoundEmail(''); }} className="text-xs font-bold text-gray-400 hover:text-yonsei-blue transition-colors">비밀번호 찾기</button>
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
                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(!isPhoneValid || fieldErrors.phone) ? 'text-red-400' : 'text-gray-300'}`} />
                        <input 
                          type="text" 
                          value={regPhone}
                          onChange={handlePhoneChange}
                          placeholder="010-0000-0000" 
                          maxLength={13}
                          className={`w-full bg-gray-50 border rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 outline-none transition-all ${(!isPhoneValid || fieldErrors.phone) ? 'border-red-400 focus:ring-red-500/10' : 'border-gray-100 focus:ring-yonsei-blue/5'}`}
                        />
                      </div>
                      {fieldErrors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.phone}</p>}
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
                      연세인
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
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">학번/교번</label>
                  <div className="relative">
                    <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(!isStudentIdValid || fieldErrors.studentId) ? 'text-red-400' : 'text-gray-300'}`} />
                    <input 
                      type="text" 
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      placeholder="학번 또는 교번 입력" 
                      disabled={!isStudent}
                      className={`w-full bg-gray-50 border rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 outline-none transition-all ${(!isStudentIdValid || fieldErrors.studentId) ? 'border-red-400 focus:ring-red-500/10' : 'border-gray-100 focus:ring-yonsei-blue/5'}`}
                    />
                  </div>
                  {fieldErrors.studentId && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.studentId}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">이메일</label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(!isEmailValid || fieldErrors.email) ? 'text-red-400' : 'text-gray-300'}`} />
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="example@yonsei.ac.kr" 
                      className={`w-full bg-gray-50 border rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 outline-none transition-all ${(!isEmailValid || fieldErrors.email) ? 'border-red-400 focus:ring-red-500/10' : 'border-gray-100 focus:ring-yonsei-blue/5'}`}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">비밀번호</label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.pwd ? 'text-red-400' : 'text-gray-300'}`} />
                      <input 
                        type="password" 
                        value={regPwd}
                        onChange={(e) => setRegPwd(e.target.value)}
                        placeholder="••••" 
                        className={`w-full bg-gray-50 border rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 outline-none transition-all ${fieldErrors.pwd ? 'border-red-400 focus:ring-red-500/10' : 'border-gray-100 focus:ring-yonsei-blue/5'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">비밀번호 확인</label>
                    <div className="relative">
                      <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(!isPwdConfirmValid) ? 'text-red-400' : 'text-gray-300'}`} />
                      <input 
                        type="password" 
                        value={regPwdConfirm}
                        onChange={(e) => setRegPwdConfirm(e.target.value)}
                        placeholder="••••" 
                        className={`w-full bg-gray-50 border rounded-[20px] pl-10 pr-4 py-3.5 text-sm font-medium focus:bg-white focus:ring-4 outline-none transition-all ${(!isPwdConfirmValid) ? 'border-red-400 focus:ring-red-500/10' : 'border-gray-100 focus:ring-yonsei-blue/5'}`}
                      />
                    </div>
                  </div>
                </div>
                {fieldErrors.pwd && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.pwd}</p>}
                
                <div className="text-[10px] space-y-1.5 mt-2 ml-1 font-bold">
                  <div className={`flex items-center gap-1.5 ${pwdLengthValid ? "text-green-500" : "text-gray-400"}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${pwdLengthValid ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      {pwdLengthValid && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                    </div>
                    8자리 이상
                  </div>
                  <div className={`flex items-center gap-1.5 ${isPwdTypesValid ? "text-green-500" : "text-gray-400"}`}>
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${isPwdTypesValid ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                      {isPwdTypesValid && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                    </div>
                    영문 대/소문자, 숫자, 특수문자 중 3가지 이상 포함
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
            {/* FIND EMAIL FORM */}
            {mode === 'find-email' && (
              <form onSubmit={handleFindEmailSubmit} className="space-y-4">
                {!foundEmail ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">성함</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="text" 
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="실명" 
                          className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">연락처</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input 
                          type="text" 
                          value={regPhone}
                          onChange={handlePhoneChange}
                          placeholder="010-0000-0000" 
                          maxLength={13}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-yonsei-blue hover:bg-blue-800 text-white font-black py-4 rounded-[20px] transition duration-300 shadow-lg shadow-yonsei-blue/20 flex justify-center items-center gap-2 mt-4"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '이메일 찾기'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-2">회원님의 이메일은 다음과 같습니다.</p>
                    <div className="text-2xl font-black text-yonsei-blue bg-blue-50 py-4 rounded-xl border border-blue-100">
                      {foundEmail}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setMode('login'); setLoginEmail(''); setErrorMsg(''); setSuccessMsg(''); setFieldErrors({}); }}
                      className="w-full bg-yonsei-blue hover:bg-blue-800 text-white font-black py-4 rounded-[20px] transition duration-300 shadow-lg mt-6"
                    >
                      로그인하러 가기
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">이메일</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-yonsei-blue transition-colors" />
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="가입하신 이메일을 입력하세요" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-yonsei-blue hover:bg-blue-800 text-white font-black py-4 rounded-[20px] transition duration-300 shadow-lg flex justify-center items-center gap-2 mt-4"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '재설정 링크 받기'}
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

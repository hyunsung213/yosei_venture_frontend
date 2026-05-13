'use client';

import React, { useState, Suspense } from 'react';
import { Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { postResetPassword, postVerifyResetToken } from '@/api/login';
import Link from 'next/link';
import Image from 'next/image';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setErrorMsg('유효하지 않은 접근입니다. 재설정 링크를 다시 확인해주세요.');
      return;
    }
    
    const verifyToken = async () => {
      try {
        await postVerifyResetToken({ token });
        setIsTokenValid(true);
      } catch (err: any) {
        console.error(err);
        setIsTokenValid(false);
        setErrorMsg(err.response?.data?.message || '유효하지 않거나 만료된 토큰입니다.');
      }
    };
    
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('유효하지 않은 접근입니다. 재설정 링크를 다시 확인해주세요.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMsg('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await postResetPassword({ token, newPassword });
      setSuccessMsg('비밀번호가 성공적으로 재설정되었습니다. 다시 로그인해주세요.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 pt-24 pb-20 relative overflow-hidden flex flex-col items-center">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-50/50 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[540px] z-10">
        <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,56,118,0.05)] border border-gray-100 overflow-hidden px-8 md:px-12 py-12">
          
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-2 mb-8">
               <div className="w-16 h-16 relative">
                 <Image src="/image/yonsei_logo.png" alt="Logo" fill className="object-contain" />
               </div>
            </Link>
            <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
              새로운 비밀번호 설정
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              새로 사용할 비밀번호를 입력해주세요.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-2xl flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {isTokenValid === null && !errorMsg && !successMsg && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
            </div>
          )}

          {!successMsg && isTokenValid === true && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">새 비밀번호</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-yonsei-blue transition-colors" />
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold ml-1 pt-1">(권장) 영문, 숫자, 특수문자 조합 8자리 이상 (예: Abcd1234!)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1">새 비밀번호 확인</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-yonsei-blue transition-colors" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 border border-gray-100 rounded-[20px] pl-12 pr-4 py-4 font-medium placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-yonsei-blue/5 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-yonsei-blue hover:bg-blue-800 text-white font-black py-4 rounded-[20px] transition duration-300 shadow-lg shadow-yonsei-blue/20 flex justify-center items-center gap-2 mt-6"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    비밀번호 변경
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-yonsei-blue transition-colors">
              로그인 화면으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

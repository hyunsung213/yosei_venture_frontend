'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMe } from '@/api/get';
import { putUser } from '@/api/put';
import { User, Hash, Lock, Save, Loader2, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MyPage() {
  const router = useRouter();
  const { role } = useAuth();

  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Read-only display
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (role === 'guest') { router.push('/auth/login?redirect=/mypage'); return; }
    (async () => {
      const me = await getMe();
      if (me) {
        setUserId(me.id || me._id || '');
        setName(me.name || '');
        setStudentId(me.studentId || '');
        setEmail(me.email || '');
        setPhone(me.phone || '');
      }
      setLoading(false);
    })();
  }, [role]);

  const pwdMatch = pwd === pwdConfirm;
  const pwdValid = pwd === '' || pwd.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (pwd && !pwdMatch) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (pwd && !pwdValid) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }

    setSaving(true);
    const payload: Record<string, string> = { name, phone, studentId };
    if (pwd) payload.pwd = pwd;

    const res = await putUser(userId, payload);
    if (res.success) {
      setSuccess(true);
      setPwd('');
      setPwdConfirm('');
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.message || '저장에 실패했습니다.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yonsei-blue animate-spin" />
      </div>
    );
  }

  const ROLE_LABELS: Record<string, string> = {
    guest: '게스트', general: '일반(입주기업)', wave: 'WAVE 팀', super: '관리자'
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pt-32 pb-20">
      <div className="max-w-xl mx-auto px-4">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-bold mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-yonsei-blue to-blue-700 p-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{name}</h1>
              <p className="text-blue-100 text-sm mt-1">{email}</p>
              <span className="inline-block mt-2 text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          </div>

          {/* Read-only info */}
          <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">이메일</p>
              <p className="text-sm font-bold text-gray-700">{email || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">전화번호</p>
              <p className="text-sm font-bold text-gray-700">{phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-black text-gray-900 pb-2 border-b border-gray-100">정보 수정</h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" /> 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue transition"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-gray-400" /> 학번/교번
            </label>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue transition"
              placeholder="학번 또는 교번을 입력하세요"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-gray-400" /> 전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue transition"
              placeholder="010-0000-0000"
            />
          </div>

          {/* Password */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold mb-3">비밀번호 변경 (변경하지 않으려면 비워두세요)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gray-400" /> 새 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={pwd}
                    onChange={e => setPwd(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue pr-10 transition ${!pwdValid ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'}`}
                    placeholder="6자 이상 입력하세요"
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwd && !pwdValid && <p className="text-xs text-red-500 mt-1 font-bold">6자 이상 입력하세요.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gray-400" /> 새 비밀번호 확인
                </label>
                <div className="relative">
                  <input
                    type={showPwdConfirm ? 'text' : 'password'}
                    value={pwdConfirm}
                    onChange={e => setPwdConfirm(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue pr-10 transition ${pwdConfirm && !pwdMatch ? 'border-red-300 focus:ring-red-300' : 'border-gray-200'}`}
                    placeholder="비밀번호를 한 번 더 입력하세요"
                  />
                  <button type="button" onClick={() => setShowPwdConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwdConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwdConfirm && !pwdMatch && <p className="text-xs text-red-500 mt-1 font-bold">비밀번호가 일치하지 않습니다.</p>}
                {pwdConfirm && pwdMatch && pwd && <p className="text-xs text-green-600 mt-1 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> 비밀번호가 일치합니다.</p>}
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-bold">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-600 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> 정보가 성공적으로 저장되었습니다.
            </div>
          )}

          <button
            type="submit"
            disabled={saving || (!!pwd && (!pwdMatch || !pwdValid))}
            className="w-full flex items-center justify-center gap-2 bg-yonsei-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            변경사항 저장
          </button>
        </form>
      </div>
    </div>
  );
}

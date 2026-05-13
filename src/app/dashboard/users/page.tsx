'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/api/get';
import { putUser } from '@/api/put';
import { deleteUser } from '@/api/delete';
import { UserSimple, RoleType } from '@/interface/interface';
import {
  ShieldAlert, Search, Loader2, Trash2, ChevronDown,
  ChevronUp, X, Save, RefreshCw, User, Mail, Phone,
  Hash, Shield, AlertCircle
} from 'lucide-react';

const ROLE_OPTIONS: { value: RoleType | 'general'; label: string; color: string; bg: string }[] = [
  { value: 'general', label: '일반', color: 'text-blue-600',  bg: 'bg-blue-50'  },
  { value: 'wave',    label: 'WAVE 팀',       color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'super',   label: '관리자',         color: 'text-red-600',   bg: 'bg-red-50'   },
];

function RoleBadge({ type }: { type: string }) {
  const opt = ROLE_OPTIONS.find(r => r.value === type);
  if (!opt) {
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600">
        {type || '미설정'}
      </span>
    );
  }
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${opt.bg} ${opt.color}`}>
      {opt.label}
    </span>
  );
}

interface EditForm {
  name: string;
  phone: string;
  studentId: string;
  type: RoleType | 'general';
}

export default function UserManagementPage() {
  const router = useRouter();
  const { role } = useAuth();

  const [users, setUsers] = useState<UserSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Expanded row id
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Edit form state
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  // Role accordion open
  const [roleAccordionOpen, setRoleAccordionOpen] = useState(false);

  useEffect(() => {
    if (role !== 'super') { router.push('/auth/login'); return; }
    load();
  }, [role]);

  const load = async () => {
    setRefreshing(true);
    try {
      const data = await getAllUsers();
      setUsers((data as UserSimple[]) || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRowClick = (user: UserSimple) => {
    const uid = user.id || (user as any)._id || '';
    if (expandedId === uid) {
      setExpandedId(null);
      setEditForm(null);
      setRoleAccordionOpen(false);
    } else {
      setExpandedId(uid);
      const currentType = (user as any).type ?? (user as any).role;
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
        type: ROLE_OPTIONS.find(r => r.value === currentType) ? currentType : 'guest',
      });
      setRoleAccordionOpen(false);
      setSaveSuccess(null);
    }
  };

  const handleSave = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!editForm) return;
    setSaving(true);
    setSaveSuccess(null);

    const payload = {
      name: editForm.name,
      phone: editForm.phone,
      studentId: editForm.studentId,
      type: editForm.type,
    };

    const res = await putUser(userId, payload);
    if (res.success) {
      setSaveSuccess(userId);
      await load();
      setTimeout(() => {
        setExpandedId(null);
        setEditForm(null);
        setSaveSuccess(null);
      }, 1200);
    } else {
      alert(res.message || '저장에 실패했습니다.');
    }
    setSaving(false);
  };

  const handleDelete = async (e: React.MouseEvent, userId: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`정말로 '${name}' 유저를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    const res = await deleteUser(userId);
    if (res.success) {
      setUsers(prev => prev.filter(u => (u.id || (u as any)._id) !== userId));
      setExpandedId(null);
    } else {
      alert(res.message);
    }
  };

  const filtered = users.filter(u =>
    u.name?.includes(search) ||
    u.email?.includes(search) ||
    u.studentId?.includes(search) ||
    u.phone?.includes(search)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yonsei-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-yonsei-blue" />
              유저 관리
            </h1>
            <p className="text-sm text-gray-500 mt-1">총 {users.length}명의 회원을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 학번, 전화번호..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-yonsei-blue focus:bg-white transition-all w-60"
              />
            </div>
            <button
              onClick={load}
              className={`p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {ROLE_OPTIONS.map(opt => {
            const count = users.filter(u => (u as any).type === opt.value).length;
            return (
              <div key={opt.value} className={`${opt.bg} rounded-2xl p-4 border border-gray-100`}>
                <p className={`text-2xl font-black ${opt.color}`}>{count}</p>
                <p className="text-xs font-bold text-gray-500 mt-1">{opt.label}</p>
              </div>
            );
          })}
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
            <div className="col-span-3">이름</div>
            <div className="col-span-4">이메일</div>
            <div className="col-span-2">학번/교번/ID</div>
            <div className="col-span-2">권한</div>
            <div className="col-span-1 text-right">관리</div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="font-bold">검색된 유저가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(user => {
                const uid = user.id || (user as any)._id || '';
                const isExpanded = expandedId === uid;
                const userType = (user as any).type ?? (user as any).role ?? '';

                return (
                  <div key={uid}>
                    {/* Row */}
                    <div
                      className={`grid grid-cols-12 gap-2 px-6 py-4 cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                      onClick={() => handleRowClick(user)}
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yonsei-blue/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-yonsei-blue" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.phone || '-'}</p>
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center">
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <p className="text-sm text-gray-500 font-mono">{user.studentId || '-'}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <RoleBadge type={userType} />
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </div>

                    {/* Expanded Edit Panel */}
                    {isExpanded && editForm && (
                      <div className="px-6 py-5 bg-blue-50/20 border-t border-blue-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                          {/* Name */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> 이름
                            </label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue"
                            />
                          </div>
                          {/* Phone */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" /> 전화번호
                            </label>
                            <input
                              type="text"
                              value={editForm.phone}
                              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue"
                            />
                          </div>
                          {/* StudentId */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                              <Hash className="w-3.5 h-3.5" /> 학번/교번/ID
                            </label>
                            <input
                              type="text"
                              value={editForm.studentId}
                              onChange={e => setEditForm({ ...editForm, studentId: e.target.value })}
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yonsei-blue"
                            />
                          </div>
                          {/* Email (read-only) */}
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" /> 이메일 (수정 불가)
                            </label>
                            <input
                              type="text"
                              value={user.email}
                              disabled
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-100 text-gray-400"
                            />
                          </div>
                        </div>

                        {/* Role Accordion */}
                        <div className="mb-5">
                          <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" /> 권한(유저 타입)
                          </label>
                          <button
                            type="button"
                            onClick={() => setRoleAccordionOpen(o => !o)}
                            className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-bold hover:border-yonsei-blue transition"
                          >
                            <RoleBadge type={editForm.type} />
                            {roleAccordionOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          {roleAccordionOpen && (
                            <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                              {ROLE_OPTIONS.map(opt => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => {
                                    setEditForm({ ...editForm, type: opt.value as RoleType | 'general' });
                                    setRoleAccordionOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors ${
                                    editForm.type === opt.value
                                      ? `${opt.bg} ${opt.color}`
                                      : 'bg-white text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${opt.bg.replace('bg-', 'bg-').replace('-50', '-400')}`} />
                                  {opt.label}
                                  {editForm.type === opt.value && (
                                    <span className="ml-auto text-xs font-black">✓ 선택됨</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={(e) => handleDelete(e, uid, user.name)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition border border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                            유저 삭제
                          </button>
                          <div className="flex items-center gap-2">
                            {saveSuccess === uid && (
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                ✓ 저장되었습니다
                              </span>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedId(null); setEditForm(null); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition border border-gray-200"
                            >
                              <X className="w-4 h-4" />
                              취소
                            </button>
                            <button
                              onClick={(e) => handleSave(e, uid)}
                              disabled={saving}
                              className="flex items-center gap-1.5 px-5 py-2 bg-yonsei-blue text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition shadow-sm disabled:opacity-60"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              저장
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

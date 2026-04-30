'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTeamsWithStatus, getAllUsers } from '@/api/get';
import { postTeam } from '@/api/post';
import { putPlan } from '@/api/put';
import { TeamWithPlanStatus, UserSimple, TeamType, UserSoSimple } from '@/interface/interface';
import { PlusCircle, ShieldAlert, Edit, Save, Loader2, Users, Search, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getImage } from '@/utils/imageUtils';

const TEAM_TYPES: { value: TeamType, label: string }[] = [
  { value: 'innovative', label: 'Innovation' },
  { value: 'lab1th', label: 'Lab 1부' },
  { value: 'lab2th', label: 'Lab 2부' },
  { value: 'local1th', label: 'Local 일반창업형' },
  { value: 'local2th', label: 'Local 창업체험형' },
];

export default function WaveAdminDashboard() {
  const router = useRouter();
  const { role } = useAuth();
  
  const [teams, setTeams] = useState<TeamWithPlanStatus[]>([]);
  const [users, setUsers] = useState<UserSoSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Team Form State
  const [newTeam, setNewTeam] = useState({
    name: '',
    describe: '',
    type: 'innovative' as TeamType,
    balance: '',
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // 권한 체크
  useEffect(() => {
    if (role !== 'super') {
      router.push('/auth/login');
    } else {
      loadData();
    }
  }, [role, router]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [teamsData, usersData] = await Promise.all([
        getAllTeamsWithStatus(),
        getAllUsers()
      ]);
      if (teamsData) setTeams(teamsData);
      if (usersData) setUsers(usersData);
    } catch (error) {
      console.error("데이터 로드 실패", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleGlobalEditToggle = async (enable: boolean) => {
    if (!window.confirm(`모든 팀의 수정 권한을 ${enable ? '허용' : '차단'}하시겠습니까?`)) return;
    
    setIsRefreshing(true);
    let successCount = 0;
    
    // 이 방식은 N+1 API 호출이 발생하므로 실제 운영 시에는 백엔드에 일괄 수정 API를 요청하는 것이 좋습니다.
    // 현재는 putPlan을 개별 호출합니다.
    for (const team of teams) {
      if (team.plan && team.plan.id) {
        const res = await putPlan(team.plan.id, { isEdit: enable });
        if (res.success) successCount++;
      }
    }
    
    alert(`총 ${teams.length}개 팀 중 ${successCount}개 팀의 권한이 변경되었습니다.`);
    loadData();
  };

  const handleToggleTeamEdit = async (team: TeamWithPlanStatus) => {
    if (!team.plan || !team.plan.id) {
      alert("Plan이 존재하지 않아 권한을 수정할 수 없습니다.");
      return;
    }
    const targetStatus = !team.plan.isEdit;
    if (!window.confirm(`[${team.name}] 팀의 수정 권한을 ${targetStatus ? '허용' : '차단'}하시겠습니까?`)) return;

    setIsRefreshing(true);
    const res = await putPlan(team.plan.id, { isEdit: targetStatus });
    if (res.success) {
      loadData();
    } else {
      alert(res.message || "권한 수정에 실패했습니다.");
      setIsRefreshing(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTeam.name) return alert("팀 이름을 입력해주세요.");
    
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData();
    
    formData.append("name", newTeam.name);
    formData.append("describe", newTeam.describe);
    formData.append("type", newTeam.type);
    
    // balance: 콤마 제거 후 number로 변환
    const numericBalance = Number(newTeam.balance.replace(/,/g, ''));
    formData.append("balance", numericBalance.toString());

    // selectedUserIds: [~~,~~,~~] 형태의 문자열로 전송
    formData.append("userIds", JSON.stringify(selectedUserIds));

    const imgInput = form.elements.namedItem("img") as HTMLInputElement;
    if (imgInput?.files?.[0]) {
      formData.append("img", imgInput.files[0]);
    }
    const res = await postTeam(formData);
    if (res.success) {
      alert("팀이 생성되었습니다.");
      setIsModalOpen(false);
      setNewTeam({ name: '', describe: '', type: 'innovative', balance: '' });
      setSelectedUserIds([]);
      loadData();
    } else {
      alert(res.message || "팀 생성에 실패했습니다.");
    }
    setIsSubmitting(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (isLoading || role !== 'super') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yonsei-blue animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.name.includes(userSearchTerm) || u.email.includes(userSearchTerm) || (u.studentId && u.studentId.includes(userSearchTerm))
  );

  return (
    <div className="min-h-screen bg-gray-50/30 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-yonsei-blue" />
              팀 관리 대시보드
            </h1>
            <p className="text-sm text-gray-500 mt-1">총 {teams.length}개의 팀을 관리하고 처리 대기 중인 항목을 검토합니다.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => handleGlobalEditToggle(true)}
              className="px-4 py-2 bg-blue-50 text-yonsei-blue text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors"
            >
              전체 편집 허용
            </button>
            <button 
              onClick={() => handleGlobalEditToggle(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              전체 편집 마감
            </button>
            <button 
              onClick={loadData}
              className={`p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-yonsei-blue text-white text-sm font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              새 팀 생성
            </button>
          </div>
        </div>

        {/* Teams by Category */}
        <div className="space-y-12">
          {TEAM_TYPES.map(category => {
            const categoryTeams = teams.filter(t => t.type === category.value);
            if (categoryTeams.length === 0) return null;

            return (
              <div key={category.value}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <span className="bg-yonsei-blue text-white px-3 py-1 rounded-full text-xs">{categoryTeams.length}</span>
                  {category.label}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTeams.map(team => (
                    <div key={team.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative group">
                      
                      {/* Pending Badge */}
                      {team.plan?.isUsagePending && (
                        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          요청 대기중
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-200">
                            <img 
                              src={getImage(team.img, '/image/default-team.png')} 
                              alt={team.name}
                              className="object-cover w-full h-full absolute inset-0"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900">{team.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{team.describe || "소개가 없습니다."}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-500">배정 예산</span>
                            <span className="text-sm font-bold text-gray-900">{team.balance?.toLocaleString() || 0}원</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">소속 멤버</span>
                            <span className="text-sm font-bold text-gray-900">{team.user?.length || 0}명</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link 
                            href={`/wave/team?teamId=${team.id || (team as any)._id}`}
                            className="flex-1 text-center py-2 bg-blue-50 text-yonsei-blue text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            관리 접속
                          </Link>
                          <button 
                            onClick={() => handleToggleTeamEdit(team)}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-bold rounded-lg transition-colors border ${
                              team.plan?.isEdit 
                                ? "bg-white border-green-200 text-green-600 hover:bg-green-50" 
                                : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                            {team.plan?.isEdit ? "편집 가능" : "편집 불가"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Team Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left: Team Form */}
            <div className="flex-1 p-8 overflow-y-auto border-r border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">새 팀 생성</h2>
                <button onClick={() => setIsModalOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <form id="create-team-form" onSubmit={handleCreateTeam} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">팀 이름 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required 
                    value={newTeam.name}
                    onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none text-sm"
                    placeholder="예: Yonsei Innovators"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">분류 (Type)</label>
                  <select 
                    value={newTeam.type}
                    onChange={e => setNewTeam({...newTeam, type: e.target.value as TeamType})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none text-sm bg-white"
                  >
                    {TEAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">배정 예산 (원)</label>
                  <input 
                    type="text" 
                    value={newTeam.balance}
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      const formatted = rawValue ? Number(rawValue).toLocaleString() : '';
                      setNewTeam({...newTeam, balance: formatted});
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none text-sm text-right"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">팀 로고 업로드 (선택)</label>
                  <input 
                    name="img"
                    type="file" 
                    accept=".jpg, .jpeg, .png"
                    className="w-full border border-gray-200 py-2.5 px-4 rounded-xl focus:ring-2 focus:ring-yonsei-blue/50 outline-none transition-shadow text-gray-700 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">팀 소개</label>
                  <textarea 
                    rows={4}
                    value={newTeam.describe}
                    onChange={e => setNewTeam({...newTeam, describe: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-yonsei-blue outline-none text-sm resize-none"
                    placeholder="팀의 주요 프로젝트나 비전을 적어주세요."
                  />
                </div>

                <div className="pt-4 hidden md:block">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-yonsei-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    팀 생성 완료하기
                  </button>
                </div>
              </form>
            </div>

            {/* Right: User Selection */}
            <div className="flex-1 bg-gray-50 flex flex-col max-h-[50vh] md:max-h-none">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yonsei-blue" />
                  팀원 선택 <span className="text-yonsei-blue bg-blue-50 px-2 py-0.5 rounded-full text-xs">{selectedUserIds.length}명</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="hidden md:block text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="p-4 bg-white border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="이름, 이메일, 학번으로 검색..." 
                    value={userSearchTerm}
                    onChange={e => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-yonsei-blue outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">검색된 유저가 없습니다.</div>
                ) : (
                  filteredUsers.map((user, idx) => {
                    const userId = user.id || (user as any)._id;
                    return (
                    <label 
                      key={userId || idx} 
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedUserIds.includes(userId) ? 'border-yonsei-blue bg-blue-50/50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedUserIds.includes(userId)}
                        onChange={() => toggleUserSelection(userId)}
                        className="w-4 h-4 text-yonsei-blue rounded border-gray-300 focus:ring-yonsei-blue"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm truncate">{user.name}</span>
                          {user.studentId && <span className="text-xs text-gray-400">{user.studentId}</span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </label>
                  )})
                )}
              </div>

              {/* Mobile Submit Button */}
              <div className="p-4 bg-white border-t border-gray-200 md:hidden">
                <button 
                  type="submit"
                  form="create-team-form"
                  disabled={isSubmitting}
                  className="w-full bg-yonsei-blue text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors disabled:bg-gray-400"
                >
                  {isSubmitting ? "생성 중..." : "팀 생성 완료하기"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

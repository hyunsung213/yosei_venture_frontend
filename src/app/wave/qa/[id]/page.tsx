"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Lock, Edit2, CheckCircle2, MessageSquare, ShieldAlert, Trash2 } from "lucide-react";
import { getQAById } from "@/api/get";
import { putQA } from "@/api/put";
import { deleteQA } from "@/api/delete";
import { Qa } from "@/interface/interface";
import { useAuth } from "@/contexts/AuthContext";

export default function WaveQADetailPage() {
  const params = useParams();
  const router = useRouter();
  const qaId = params.id as string;
  const { role } = useAuth();

  const [qa, setQa] = useState<Qa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Access control
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessPassword, setAccessPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showEditAuthPrompt, setShowEditAuthPrompt] = useState(false);
  const [editAuthPassword, setEditAuthPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Admin answer
  const [adminAnswer, setAdminAnswer] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    if (role === 'guest' || role === 'general') {
      router.push('/auth/login?redirect=/wave/qa');
      return;
    }

    if (!qaId) return;

    const fetchQa = async () => {
      setLoading(true);
      try {
        const result = await getQAById(qaId);
        if (!result) {
          setError("Q&A를 찾을 수 없습니다.");
        } else {
          setQa(result);
          if (role === "super" || role === "wave") {
            setIsUnlocked(true);
          }
          setEditTitle(result.title);
          setEditContent(result.content);
          if (result.answer) setAdminAnswer(result.answer);
        }
      } catch (err) {
        console.error(err);
        setError("Q&A를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchQa();
  }, [qaId, role]);

  const handleUnlock = () => {
    if (qa?.pwd === accessPassword) {
      setIsUnlocked(true);
      setVerifiedPassword(accessPassword);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  const handleEditClick = () => {
    if (verifiedPassword === qa?.pwd || role === "super" || role === "wave") {
      setIsEditing(true);
    } else {
      setShowEditAuthPrompt(true);
    }
  };

  const handleEditAuth = () => {
    if (qa?.pwd === editAuthPassword) {
      setVerifiedPassword(editAuthPassword);
      setShowEditAuthPrompt(false);
      setIsEditing(true);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle || !editContent) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    setIsSaving(true);
    const res = await putQA(qaId, { title: editTitle, content: editContent });
    setIsSaving(false);

    if (res.success) {
      alert("수정되었습니다.");
      setIsEditing(false);
      setQa(prev => prev ? { ...prev, title: editTitle, content: editContent } : null);
    } else {
      alert(res.message || "수정 실패");
    }
  };

  const handleSaveAnswer = async () => {
    if (!adminAnswer) {
      alert("답변 내용을 입력해주세요.");
      return;
    }
    setIsAnswering(true);
    const res = await putQA(qaId, { answer: adminAnswer, status: "answered" });
    setIsAnswering(false);

    if (res.success) {
      alert("답변이 등록되었습니다.");
      setQa(prev => prev ? { ...prev, answer: adminAnswer, status: "answered" } : null);
    } else {
      alert(res.message || "답변 등록 실패");
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 질문을 삭제하시겠습니까?")) return;
    const res = await deleteQA(qaId);
    if (res.success) {
      alert("삭제되었습니다.");
      router.push("/wave/qa");
    } else {
      alert(res.message || "삭제 실패");
    }
  };

  if (role === 'general' || role === 'guest') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-gray-500 font-bold tracking-tight">Wave팀 전용 페이지입니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-yonsei-blue" />
        <p className="font-bold">Q&A를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !qa) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4 text-red-500">
        <p className="font-bold text-lg">{error ?? "Q&A를 찾을 수 없습니다."}</p>
        <Link href="/wave/qa" className="text-sm text-gray-500 hover:text-yonsei-blue underline transition-colors">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full p-8 space-y-6 border border-gray-100">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">비밀글 열람</h3>
            <p className="text-gray-500 font-medium">이 글은 작성자와 관리자만 볼 수 있습니다.<br/>비밀번호를 입력해주세요.</p>
          </div>
          
          <div className="space-y-4">
            <input 
              type="password" 
              maxLength={4} 
              autoFocus
              value={accessPassword}
              onChange={(e) => setAccessPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-yonsei-blue outline-none text-center font-mono text-3xl tracking-[1em]" 
            />
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/wave/qa')} 
                className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
              >
                목록으로
              </button>
              <button 
                onClick={handleUnlock}
                className="flex-1 py-3.5 rounded-xl bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-12 md:mt-16 bg-white shadow-sm rounded-2xl border border-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/wave/qa" className="inline-flex items-center gap-2 text-gray-500 hover:text-yonsei-blue transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" />
          목록으로 돌아가기
        </Link>
        <div className="flex gap-2">
          {qa.status === 'pending' && !isEditing && (
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg font-bold transition-colors text-sm"
            >
              <Edit2 className="w-4 h-4" />
              수정하기
            </button>
          )}
          {role === 'super' && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              삭제하기
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mb-10 space-y-4 animate-in fade-in">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">제목 수정</label>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition text-lg font-bold text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">본문 수정</label>
            <textarea 
              rows={10} 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yonsei-blue focus:border-transparent outline-none transition resize-none text-gray-700 font-medium" 
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditTitle(qa.title);
                setEditContent(qa.content);
              }} 
              className="px-6 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition"
            >
              취소
            </button>
            <button 
              onClick={handleSaveEdit} 
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition shadow-md flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              저장하기
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-10 animate-in fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded font-black whitespace-nowrap ${
              qa.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {qa.status === 'answered' ? '답변완료' : '답변 대기중'}
            </span>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-8">
            <span className="text-yonsei-blue mr-3">Q.</span>
            {qa.title}
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700 font-medium leading-relaxed whitespace-pre-wrap min-h-[150px] p-6 bg-gray-50 rounded-2xl border border-gray-100">
            {qa.content}
          </div>
        </div>
      )}

      {/* 답변 영역 */}
      {(qa.answer || role === 'super') && (
        <div className="mt-12 pt-8 border-t border-gray-100 animate-in fade-in">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-green-600" />
            관리자 답변
          </h3>
          
          {role === 'super' && qa.status === 'pending' ? (
            <div className="space-y-4">
              <textarea 
                rows={6} 
                value={adminAnswer}
                onChange={(e) => setAdminAnswer(e.target.value)}
                placeholder="답변을 작성해주세요. 등록 후에는 사용자가 질문을 수정할 수 없습니다."
                className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none text-gray-700 font-medium bg-green-50/30" 
              ></textarea>
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveAnswer} 
                  disabled={isAnswering}
                  className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition shadow-md flex items-center gap-2"
                >
                  {isAnswering ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  답변 등록완료
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8 bg-green-50/50 rounded-2xl border border-green-100">
              <div className="prose prose-lg max-w-none text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                {qa.answer || "아직 작성된 답변이 없습니다."}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 수정 시 비밀번호 확인 모달 */}
      {showEditAuthPrompt && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-yonsei-blue" />
              수정 권한 확인
            </h3>
            <p className="text-sm text-gray-500 font-medium">작성자 확인을 위해 비밀번호를 입력해주세요.<br/>(공개 글의 기본 비밀번호는 0000입니다.)</p>
            <input 
              type="password" 
              maxLength={4} 
              autoFocus
              value={editAuthPassword}
              onChange={(e) => setEditAuthPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEditAuth()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yonsei-blue outline-none text-center font-mono text-2xl tracking-[1em]" 
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowEditAuthPrompt(false)} 
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
              >
                취소
              </button>
              <button 
                onClick={handleEditAuth}
                className="flex-1 py-3 rounded-xl bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

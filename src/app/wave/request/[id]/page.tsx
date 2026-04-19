"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  getRequestById, 
  getTeamById, 
  getRequestsByTeamId 
} from "@/api/get";
import { postComment } from "@/api/post";
import { putRequestStatus, putRequest } from "@/api/put";
import { useAuth } from "@/contexts/AuthContext";
import { 
  PlusCircle, X, Loader2, Lock, FileText, Download, Building, 
  DollarSign, Tag, ShieldAlert, MessageSquare, CheckCircle, 
  XCircle, Edit, History, ChevronLeft, Send, Paperclip
} from "lucide-react";
import { getImage } from "@/utils/imageUtils";
import { Request, Team, IRequest } from "@/interface/interface";

export default function RequestDetailPage() {
  const { id } = useParams() as { id: string };
  const { role, userId, isLoaded } = useAuth();
  const router = useRouter();

  const [req, setReq] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessPw, setAccessPw] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAccessing, setIsAccessing] = useState(false);
  const [teamRequests, setTeamRequests] = useState<Request[]>([]);
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [adminComment, setAdminComment] = useState("");
  const [isReflecting, setIsReflecting] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCost, setEditCost] = useState(0);
  const [editUse, setEditUse] = useState<IRequest["use"]>("etc");
  const [editPw, setEditPw] = useState("");
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);

  const useLabels: Record<string, string> = {
    promotion: "홍보비",
    cloude: "클라우드 이용료",
    prototype: "시제품 제작비",
    etc: "기타"
  };

  // UI Tokens matching the provided image
  const LABEL_STYLE = "text-sm font-bold text-gray-700 block mb-2";
  const CARD_STYLE = "bg-white rounded-3xl shadow-sm border border-gray-100";
  const BOX_STYLE = "bg-white border border-gray-200 rounded-xl p-4";

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "guest") {
      router.push("/auth/login?redirect=/wave/request/" + id);
      return;
    }

    if (role === "super") {
      setIsAuthorized(true);
      fetchDetail(id);
    } else {
      setLoading(false);
    }
  }, [id, role, isLoaded]);

  async function fetchDetail(requestId: string, password?: string) {
    setLoading(true);
    setIsAccessing(true);
    try {
      const data = await getRequestById(requestId, password);
      console.log(data);
      if (data) {
        setReq(data);
        setIsAuthorized(true);
        setReviewStatus(data.state as any);
        if (data.team.id) {
          getRequestsByTeamId(data.team.id).then(res => setTeamRequests(res || []));
        }
      } else {
        if (password) alert("비밀번호가 틀렸습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsAccessing(false);
    }
  }

  const handleReflect = async () => {
    if (!adminComment) {
      alert("검토 의견을 작성해 주세요.");
      return;
    }
    setIsReflecting(true);
    try {
      const resStatus = await putRequestStatus(id, { state: reviewStatus });
      const resComment = await postComment({ requestId: id, comment: adminComment, userId, qaId: "" });
      if (resStatus.success && resComment.success) {
        alert("성공적으로 반영되었습니다.");
        fetchDetail(id);
        setAdminComment("");
      } else {
        alert("반영 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReflecting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle || !editContent || !editPw) {
      alert("모든 필드를 입력해 주세요.");
      return;
    }
    setIsPendingUpdate(true);
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContent);
    formData.append("pw", editPw);
    formData.append("cost", editCost.toString());
    formData.append("use", editUse);
    if (req?.teamId) formData.append("teamId", req.teamId.id);
    if (editFiles) Array.from(editFiles).forEach(f => formData.append("files", f));
    try {
      const res = await putRequest(id, formData);
      if (res.success) {
        alert("수정이 완료되었습니다.");
        setIsEditModalOpen(false);
        fetchDetail(id, editPw);
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPendingUpdate(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-yonsei-blue" />
        <p className="text-sm font-bold text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-3">
            <Lock className="w-10 h-10 text-yonsei-blue mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-900">비밀번호 확인</h3>
            <p className="text-sm text-gray-500 font-medium">설정한 4자리 번호를 입력해 주세요.</p>
          </div>
          <input 
            type="password" maxLength={4} autoFocus value={accessPw}
            onChange={(e) => setAccessPw(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchDetail(id, accessPw); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-yonsei-blue outline-none text-center font-mono text-3xl tracking-widest bg-gray-50/30 transition-all font-bold" 
          />
          <div className="flex gap-3">
            <button onClick={() => router.back()} className="flex-1 py-3.5 rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition">취소</button>
            <button onClick={() => fetchDetail(id, accessPw)} disabled={isAccessing} className="flex-1 py-3.5 rounded-xl bg-yonsei-blue text-white font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2">
              {isAccessing && <Loader2 className="w-4 h-4 animate-spin" />}
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!req) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 px-4">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.push("/wave/request")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition"
        >
          <ChevronLeft className="w-5 h-5" />
          목록으로
        </button>
        {role !== 'super' && (
          <button 
            onClick={() => {
              setEditTitle(req.title); setEditContent(req.content);
              setEditCost(req.cost); setEditUse(req.use);
              setEditPw(""); setIsEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            <Edit className="w-4 h-4" />
            수정
          </button>
        )}
      </div>

      <main className={CARD_STYLE + " overflow-hidden"}>
        {/* Header Section */}
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{req.title}</h1>
            </div>
            <div className="flex items-center">
              <span className={`px-4 py-2 rounded-xl text-xm font-bold uppercase tracking-tight shadow-sm border ${
                req.state === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                req.state === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {req.state === 'approved' ? '승인완료' : req.state === 'rejected' ? '반려' : '심사중'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
           {/* Section 1: Team Box (Matches "신청 팀" in image) */}
           {req.teamId && (
             <div className="space-y-2">
               <label className={LABEL_STYLE}>신청 팀</label>
               <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-4">
                  <div className="p-2 bg-blue-50/50 rounded-lg shrink-0">
                    <Building className="w-5 h-5 text-yonsei-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{req.teamId.name}</p>
                    <p className="text-xs text-gray-400 font-medium line-clamp-1">{req.teamId.describe}</p>
                  </div>
                  {req.teamId.img && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                      <img src={getImage(req.teamId.img)} alt={req.teamId.name} className="w-full h-full object-cover" />
                    </div>
                  )}
               </div>
             </div>
           )}

           {/* Section 2: Use & Cost Box (Matches image bottom row) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className={LABEL_STYLE}>신청 비용 (원)</label>
                 <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <DollarSign className="w-5 h-5 text-yonsei-blue" />
                       <span className="font-bold text-gray-900">{req.cost?.toLocaleString()}</span>
                    </div>
                    <span className="text-sm text-gray-400 font-bold">원</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className={LABEL_STYLE}>비용 용도</label>
                 <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
                    <Tag className="w-5 h-5 text-yonsei-blue" />
                    <span className="font-bold text-gray-900">{useLabels[req.use] || '기타'}</span>
                 </div>
              </div>
           </div>

           {/* Section 3: Description */}
           <div className="space-y-3">
             <label className={LABEL_STYLE}>상세 내용</label>
             <div className="text-base text-gray-700 leading-relaxed font-medium whitespace-pre-wrap p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
               {req.content}
             </div>
           </div>

           {/* Section 4: Attachments */}
           <div className="space-y-3">
              <label className={LABEL_STYLE}>증빙 파일 첨부</label>
              <div className="flex flex-wrap gap-3">
                {req.files && req.files.length > 0 ? (
                  req.files.map((file: any, idx: number) => (
                    <a 
                      key={idx} href={typeof file === 'string' ? file : file?.url} target="_blank"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all group"
                    >
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-yonsei-blue transition-colors" />
                      <span className="text-xs font-bold text-gray-600 truncate max-w-[200px]">
                        {((typeof file === 'string' ? file : file?.url) || 'file').split('/').pop()}
                      </span>
                    </a>
                  ))
                ) : (
                  <span className="text-xs font-medium text-gray-300 italic">첨부된 파일이 없습니다.</span>
                )}
              </div>
           </div>
        </div>
      </main>

      {/* 심사 히스토리 (Timeline style) */}
      <section className="space-y-4">
        <h5 className="text-lg font-bold text-gray-900 flex items-center gap-2 ml-1">
          <MessageSquare className="w-5 h-5 text-yonsei-blue" />
          심사 히스토리
        </h5>
        <div className="space-y-3">
          {req.comments && req.comments.length > 0 ? (
            req.comments.map((c, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                   <ShieldAlert className="w-5 h-5 text-yonsei-blue" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Feedback</p>
                   <p className="text-gray-800 font-bold leading-relaxed">{c.comment}</p>
                   <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(c.createdAt!).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-gray-50/30 border border-dashed border-gray-200 rounded-2xl">
               <p className="text-sm font-bold text-gray-400">등록된 심사 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* Admin Panel Row (Unified Design) */}
      {role === 'super' && (
        <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6">
              <div className="flex items-center gap-4">
                 <div className="bg-yonsei-blue w-10 h-10 rounded-xl flex items-center justify-center">
                   <CheckCircle className="w-6 h-6 text-white" />
                 </div>
                 <h4 className="text-lg font-bold text-gray-900">심사 결과 반영</h4>
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-xl gap-2 border border-gray-100">
                 <button onClick={() => setReviewStatus("pending")} className={`px-5 py-2 rounded-lg text-xm font-bold transition-all ${reviewStatus === 'pending' ? 'bg-white shadow-sm text-yellow-600' : 'text-gray-400'}`}>심사대기</button>
                 <button onClick={() => setReviewStatus("approved")} className={`px-5 py-2 rounded-lg text-xm font-bold transition-all ${reviewStatus === 'approved' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}>최종승인</button>
                 <button onClick={() => setReviewStatus("rejected")} className={`px-5 py-2 rounded-lg text-xm font-bold transition-all ${reviewStatus === 'rejected' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}>반려처리</button>
              </div>
           </div>

           <div className="space-y-3">
              <label className={LABEL_STYLE}>심사 결과 피드백</label>
              <textarea 
                value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                placeholder="팀에게 전달될 상세한 심사 소견을 입력해 주세요..."
                className="w-full h-32 bg-gray-50/30 border border-gray-200 rounded-2xl p-6 text-base font-bold outline-none focus:ring-1 focus:ring-yonsei-blue transition placeholder:text-gray-300"
              />
           </div>

           <button 
            onClick={handleReflect} disabled={isReflecting}
            className="w-full py-4 bg-yonsei-blue text-white rounded-2xl font-bold text-lg hover:bg-blue-800 transition shadow-md active:scale-[0.99] flex items-center justify-center gap-3"
           >
             {isReflecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5" />}
             반영하기
           </button>
        </section>
      )}

      {/* Edit Modal (Registration look) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">처리 요청 수정</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
             </div>
             <div className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                   <label className={LABEL_STYLE}>제목</label>
                   <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="요청 건명 입력" className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-1 focus:ring-yonsei-blue transition placeholder:text-gray-300" />
                </div>
                <div className="space-y-2">
                   <label className={LABEL_STYLE}>상세 내용</label>
                   <textarea rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="처리 요청 내용을 상세히 적어주세요." className="w-full border border-gray-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-1 focus:ring-yonsei-blue transition resize-none placeholder:text-gray-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className={LABEL_STYLE}>비밀번호 (열람용)</label>
                      <input type="password" maxLength={4} value={editPw} onChange={(e) => setEditPw(e.target.value)} placeholder="숫자 4자리" className="w-full border border-gray-200 rounded-xl px-4 py-3 font-mono text-xl outline-none focus:ring-1 focus:ring-yonsei-blue transition" />
                   </div>
                   <div className="space-y-2">
                      <label className={LABEL_STYLE}>증빙 파일 첨부</label>
                      <input type="file" multiple onChange={(e) => setEditFiles(e.target.files)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-yonsei-blue hover:file:bg-blue-100 transition" />
                   </div>
                </div>
             </div>
             <div className="p-6 border-t border-gray-50 flex justify-end gap-3 bg-white">
                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition">취소</button>
                <button onClick={handleUpdate} disabled={isPendingUpdate} className="px-8 py-2.5 bg-yonsei-blue text-white rounded-xl font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2">
                   {isPendingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
                   수정하기
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

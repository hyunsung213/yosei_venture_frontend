'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Trash2 } from "lucide-react";
import { deleteProgram } from "@/api/delete";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDeleteButton({ programId }: { programId: string }) {
  const { role } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (role !== 'super') return null;

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 프로그램을 삭제하시겠습니까?")) return;

    setIsDeleting(true);
    try {
      const res = await deleteProgram(programId);
      if (res.success) {
        window.alert("프로그램이 삭제되었습니다.");
        router.push("/program/list");
      } else {
        window.alert(res.message || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      window.alert("오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "삭제 중..." : "공고 삭제"}
    </button>
  );
}

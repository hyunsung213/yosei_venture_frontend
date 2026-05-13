'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Edit } from "lucide-react";
import Link from "next/link";

interface AdminNoticeEditButtonProps {
  noticeId: string;
  type: 'community' | 'wave';
}

export default function AdminNoticeEditButton({ noticeId, type }: AdminNoticeEditButtonProps) {
  const { role } = useAuth();

  if (role !== 'super') return null;

  return (
    <Link 
      href={`/${type}/notice/${noticeId}/edit`}
      className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
    >
      <Edit className="w-4 h-4" />
      공지 수정
    </Link>
  );
}

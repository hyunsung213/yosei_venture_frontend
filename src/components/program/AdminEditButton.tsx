'use client';

import { useAuth } from "@/contexts/AuthContext";
import { Edit } from "lucide-react";
import Link from "next/link";

export default function AdminEditButton({ programId }: { programId: string }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <Link 
      href={`/program/${programId}/edit`}
      className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
    >
      <Edit className="w-4 h-4" />
      공고 수정
    </Link>
  );
}

'use client';

import { useParams } from "next/navigation";
import NoticeEditForm from "@/components/notice/NoticeEditForm";

export default function CommunityNoticeEditPage() {
  const params = useParams();
  const noticeId = params.id as string;

  return <NoticeEditForm noticeId={noticeId} type="community" />;
}

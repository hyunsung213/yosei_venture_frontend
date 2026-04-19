import ProgramNav from "@/components/layout/ProgramNav";

export const metadata = {
  title: "프로그램 상세 안내 | 연세대학교 미래캠퍼스 창업지원단",
  description: "연세대학교에서 진행하는 각종 창업 및 멘토링 프로그램 세부 일정 확인하기",
};

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 
        Main layout content spacing underneath the sticky Nav component.
        Added pt-10 to give breathing room.
      */}
            
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <ProgramNav />
        {children}
      </main>
      
    </div>
  );
}

import CommunityNav from "@/components/layout/CommunityNav";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 flex-grow relative">
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <CommunityNav />
        {children}
      </main>
    </div>
  );
}

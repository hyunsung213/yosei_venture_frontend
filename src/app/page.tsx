
import HeroSection from "@/components/sections/HeroSection";
import LiveStatusSection from "@/components/sections/LiveStatusSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ArchiveSection from "@/components/sections/ArchiveSection";

export default function Home() {
  return (
    <>

      <main className="flex-grow pt-20"> {/* pt-20 accounts for sticky header height */}
        <HeroSection />
        <ArchiveSection />
        <ProcessSection />
        <LiveStatusSection />
      </main>
    </>
  );
}

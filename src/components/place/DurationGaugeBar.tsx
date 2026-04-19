'use client';

export default function DurationGaugeBar({ 
  duration, 
  onChange 
}: { 
  duration: number; 
  onChange: (d: number) => void;
}) {
  const MIN = 2;
  const MAX = 8;
  
  // Calculate percentage for the custom progress fill background
  const percentage = ((duration - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
       <div className="flex justify-between items-center mb-6">
         <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
            시간 조절 바
         </span>
         <span className="text-2xl font-black text-yonsei-blue">{duration} <span className="text-lg text-gray-900">시간</span></span>
       </div>
       
       <div className="relative w-full pt-2 pb-4">
         {/* Native Volume-Style Range Slider */}
         <input 
           type="range" 
           min={MIN} 
           max={MAX} 
           step={1}
           value={duration}
           onChange={(e) => onChange(parseInt(e.target.value, 10))}
           className="w-full h-2.5 rounded-full appearance-none cursor-pointer outline-none transition-all duration-200"
           style={{
             background: `linear-gradient(to right, #003876 0%, #003876 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
             WebkitAppearance: 'none'
           }}
         />
         <style dangerouslySetInnerHTML={{
           __html: `
           input[type=range]::-webkit-slider-thumb {
             -webkit-appearance: none;
             appearance: none;
             width: 28px;
             height: 28px;
             border-radius: 50%;
             background: white;
             border: 3px solid #003876;
             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
             cursor: grab;
             margin-top: -1px;
             transition: transform 0.1s;
           }
           input[type=range]::-webkit-slider-thumb:hover {
             transform: scale(1.1);
           }
           input[type=range]::-webkit-slider-thumb:active {
             cursor: grabbing;
             transform: scale(1.1);
             background: #f0f9ff;
           }
         `}} />
         
         {/* Labels */}
         <div className="flex justify-between items-center mt-5 text-sm font-bold text-gray-400">
           <span>최소 {MIN}H</span>
           <span className="text-gray-300 pointer-events-none absolute left-1/2 -translate-x-1/2">
             드래그하여 조절하세요
           </span>
           <span>최대 {MAX}H</span>
         </div>
       </div>
    </div>
  );
}

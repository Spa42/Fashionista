import { cn } from '@/lib/utils';
import { Camera, Sun, Droplets, Frown, Phone, DraftingCompass, Layout } from 'lucide-react';

interface PhotoGuideProps {
  className?: string;
}

export function PhotoGuide({ className }: PhotoGuideProps) {
  const tips = [
    {
      title: "Good Lighting",
      description: "Use bright, even, natural daylight. Avoid harsh shadows or backlighting.",
      icon: <Sun className="w-4 h-4" />
    },
    {
      title: "Clean Face",
      description: "Wash your face and ensure it's free of makeup for accurate skin analysis.",
      icon: <Droplets className="w-4 h-4" />
    },
    {
      title: "Neutral Expression",
      description: "Relax your face with a neutral expression to clearly show your skin's condition.",
      icon: <Frown className="w-4 h-4" />
    },
    {
      title: "Steady Camera",
      description: "Hold your phone steady or use a timer to avoid blur for clear details.",
      icon: <Phone className="w-4 h-4" />
    },
    {
      title: "Multiple Angles",
      description: "Take photos from different angles to capture all areas of concern.",
      icon: <DraftingCompass className="w-4 h-4" />
    },
    {
      title: "Plain Background",
      description: "Use a simple, neutral background to keep focus on your skin.",
      icon: <Layout className="w-4 h-4" />
    }
  ];

  return (
    <div className={cn("rounded-lg", className)}>
      <div className="mb-3 flex items-center">
        <Camera className="w-4 h-4 mr-2 text-maroon" />
        <h3 className="text-sm font-medium text-gray-700">Photo Tips for Better Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="bg-maroon/10 text-maroon p-1.5 rounded-md flex-shrink-0">
              {tip.icon}
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-700">{tip.title}</h4>
              <p className="text-xs text-gray-500 leading-snug">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-gray-100 rounded-md p-3">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Best Photo Angles:</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square bg-white rounded-md flex flex-col items-center justify-center text-gray-500 border border-gray-200 p-1">
            <span className="text-lg transform -scale-x-100">👤</span>
            <span className="text-[10px] mt-0.5">Left Side</span>
          </div>
          <div className="aspect-square bg-white rounded-md flex flex-col items-center justify-center text-gray-500 border border-gray-200 p-1">
            <span className="text-lg">😐</span>
            <span className="text-[10px] mt-0.5">Front</span>
          </div>
          <div className="aspect-square bg-white rounded-md flex flex-col items-center justify-center text-gray-500 border border-gray-200 p-1">
            <span className="text-lg">👤</span>
            <span className="text-[10px] mt-0.5">Right Side</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
import { cn } from '@/lib/utils';

interface PhotoGuideProps {
  className?: string;
}

export function PhotoGuide({ className }: PhotoGuideProps) {
  const tips = [
    {
      title: "Good Lighting",
      description: "Use bright, even, natural daylight. Avoid direct sunlight, shadows, or backlighting.",
      icon: "☀️"
    },
    {
      title: "Clean Face, No Makeup",
      description: "Wash your face and ensure it's completely free of makeup for accurate analysis.",
      icon: "🧼"
    },
    {
      title: "Neutral Expression & Pose",
      description: "Relax your face, look straight ahead (front) or directly sideways (sides). Keep hair pulled back.",
      icon: "😐"
    },
    {
      title: "Steady Camera",
      description: "Keep your phone level with your face. Use a timer or ask someone to help for sharp photos.",
      icon: "📸"
    },
    {
      title: "Angles: Front, Left, Right",
      description: "Take one photo facing forward, one turned 90° left, and one turned 90° right.",
      icon: "↔️"
    },
    {
      title: "Plain Background",
      description: "Stand in front of a simple, solid-colored wall if possible.",
      icon: "🖼️"
    }
  ];

  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <h3 className="text-lg font-medium mb-4">Tips for Great Facial Analysis Photos</h3>
      
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="text-xl">{tip.icon}</div>
            <div>
              <h4 className="font-medium text-sm">{tip.title}</h4>
              <p className="text-xs text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-sm mb-2">Example Photo Angles</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="aspect-[3/4] bg-secondary rounded-md flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-2xl transform -scale-x-100">👤</span>
            <span className="text-xs mt-1">Left Side</span>
          </div>
          <div className="aspect-[3/4] bg-secondary rounded-md flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-2xl">😐</span>
            <span className="text-xs mt-1">Front</span>
          </div>
          <div className="aspect-[3/4] bg-secondary rounded-md flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-2xl">👤</span>
            <span className="text-xs mt-1">Right Side</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
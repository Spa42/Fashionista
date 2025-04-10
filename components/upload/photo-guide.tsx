import { cn } from '@/lib/utils';

interface PhotoGuideProps {
  className?: string;
}

export function PhotoGuide({ className }: PhotoGuideProps) {
  const tips = [
    {
      title: "Good lighting",
      description: "Take photos in natural daylight, avoiding harsh shadows or bright direct sunlight.",
      icon: "☀️"
    },
    {
      title: "No makeup",
      description: "Remove all makeup, including foundation, concealer, and tinted moisturizer.",
      icon: "🧴"
    },
    {
      title: "Clean face",
      description: "Wash your face and pat dry before taking photos for best results.",
      icon: "💦"
    },
    {
      title: "Neutral expression",
      description: "Keep a neutral facial expression looking straight at the camera for front photos.",
      icon: "😐"
    },
    {
      title: "Show your profile",
      description: "For side photos, turn your head completely to show your profile against a plain background.",
      icon: "👤"
    }
  ];

  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <h3 className="text-lg font-medium mb-4">Tips for Great Skin Analysis Photos</h3>
      
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
        <h4 className="font-medium text-sm mb-2">Example photos</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
            <span className="text-2xl">👩‍🦰</span>
          </div>
          <div className="aspect-[3/4] bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
            <span className="text-2xl">👩‍🦰</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { Stepper, Step } from '@/components/ui/stepper';
import { cn } from '@/lib/utils';

interface StepsProps {
  className?: string;
}

const steps: Step[] = [
  {
    id: 'upload',
    title: 'Upload Photos',
    description: 'Upload two clear photos of your face - one from the front and one from the side.'
  },
  {
    id: 'processing',
    title: 'Processing',
    description: 'Our AI analyzes your skin type and concerns.'
  },
  {
    id: 'results',
    title: 'Results',
    description: 'Get personalized skincare recommendations tailored for your skin.'
  }
];

export function Steps({ className }: StepsProps) {
  // Since we're on the upload page, set the active step to 'upload'
  const activeStep = 'upload';
  
  return (
    <div className={cn("mb-8", className)}>
      <Stepper steps={steps} activeStep={activeStep} />
    </div>
  );
} 
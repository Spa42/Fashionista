import React from 'react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  activeStep: string;
  className?: string;
}

export function Stepper({ steps, activeStep, className }: StepperProps) {
  const activeIndex = steps.findIndex(step => step.id === activeStep);
  
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex justify-between mb-6">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = index < activeIndex;
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                    isActive ? "bg-primary text-primary-foreground border-primary" : "",
                    isCompleted ? "bg-primary text-primary-foreground border-primary" : "",
                    !isActive && !isCompleted ? "bg-background text-muted-foreground border-muted" : "",
                  )}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isActive ? "text-primary" : "",
                    isCompleted ? "text-primary" : "",
                    !isActive && !isCompleted ? "text-muted-foreground" : "",
                  )}
                >
                  {step.title}
                </span>
              </div>
              
              {!isLast && (
                <div className="flex-1 flex items-center">
                  <div 
                    className={cn(
                      "h-0.5 w-full",
                      index < activeIndex ? "bg-primary" : "bg-border",
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {steps[activeIndex]?.description && (
        <p className="text-sm text-muted-foreground text-center">
          {steps[activeIndex].description}
        </p>
      )}
    </div>
  );
} 
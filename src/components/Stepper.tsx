import { Check } from 'lucide-react';
import { StepperStep } from '@/types';

interface StepperProps {
  steps: StepperStep[];
}

export const Stepper = ({ steps }: StepperProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${
                    step.isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : step.isCurrent
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground'
                  }
                `}
              >
                {step.isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center min-w-0 max-w-24">
                <p
                  className={`
                    text-xs font-medium truncate
                    ${
                      step.isCompleted || step.isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }
                  `}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-0.5 w-16 mx-4 transition-all duration-300
                  ${
                    step.isCompleted
                      ? 'bg-primary'
                      : 'bg-border'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { AppPhase } from '../types';

interface ProgressBarProps {
  currentPhase: AppPhase;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentPhase }) => {
  const steps = [
    { phase: AppPhase.GOAL_SETTING, label: "1. Doelen" },
    { phase: AppPhase.PLANNING, label: "2. Plannen" },
    { phase: AppPhase.MOTIVATION, label: "3. Uitvoering" },
    { phase: AppPhase.REFLECTION, label: "4. Reflectie" },
  ];

  const getCurrentStepIndex = () => {
    switch (currentPhase) {
      case AppPhase.GOAL_SETTING: return 0;
      case AppPhase.PLANNING: return 1;
      case AppPhase.MOTIVATION: return 2;
      case AppPhase.REFLECTION: return 3;
      default: return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="flex justify-between items-center relative">
        {/* Connector Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-300 -z-10"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#663366] transition-all duration-500 -z-10"
          style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
        ></div>

        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;

          return (
            <div key={step.phase} className="flex flex-col items-center gap-2 bg-[#f3f4f6] px-2">
              <div 
                className={`w-10 h-10 flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#663366] border-[#663366] text-white scale-110 shadow-lg' 
                    : isCompleted 
                      ? 'bg-white border-[#663366] text-[#663366]' 
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
                style={{ borderRadius: '0%' }} // Square/sharp look fits Fontys better sometimes, but keeping slight rounded for UI friendliness or full circle? Let's go circle but clean.
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-bold font-sans">{idx + 1}</span>
                )}
              </div>
              <span className={`text-xs md:text-sm font-medium hidden md:block ${
                isActive ? 'text-[#663366]' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Mobile Label */}
      <div className="md:hidden text-center mt-4 font-bold text-[#663366]">
         {steps[currentIndex]?.label || "Start"}
      </div>
    </div>
  );
};
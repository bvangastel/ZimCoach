
import React, { useState } from 'react';
import { Button } from './Button';
import { getPlanningTips, analyzePlan } from '../services/gemini';
import { PlanStep, LearningStrategy, PlanAnalysis } from '../types';
import { AvatarCoach } from './AvatarCoach';

interface PlannerProps {
  goal: string;
  strategy: LearningStrategy;
  initialPlan?: PlanStep[];
  onSave: (plan: PlanStep[]) => void;
  onBack: () => void;
}

export const Planner: React.FC<PlannerProps> = ({ goal, strategy, initialPlan = [], onSave, onBack }) => {
  const [steps, setSteps] = useState<PlanStep[]>(initialPlan);
  const [newStepText, setNewStepText] = useState('');
  const [newStepTime, setNewStepTime] = useState<number>(30);
  
  // AI State
  const [tips, setTips] = useState<string[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const addStep = (desc?: string) => {
    const text = desc || newStepText;
    if (!text.trim()) return;
    
    const newStep: PlanStep = {
      id: Date.now().toString() + Math.random(),
      description: text,
      durationMinutes: newStepTime,
      completed: false
    };
    setSteps([...steps, newStep]);
    if (!desc) setNewStepText('');
    setAnalysis(null); 
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
    setAnalysis(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    if (direction === 'up' && index > 0) {
      [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    }
    setSteps(newSteps);
  };

  const handleGetTips = async () => {
    setIsLoadingTips(true);
    const result = await getPlanningTips(goal, strategy);
    setTips(result);
    setIsLoadingTips(false);
  };

  const handleCheckPlan = async () => {
    if (steps.length === 0) return;
    setIsChecking(true);
    try {
      const result = await analyzePlan(goal, steps, strategy);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  const totalTime = steps.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 animate-fade-in-up">
      {/* Main Planning Area */}
      <div className="flex-1 bg-white p-8 shadow-md border-t-4 border-[#663366]">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#663366]">Maak je Planning</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Fase 2: Voorbereiding (Forethought) - Organiseer je taken.</p>

        <div className="bg-[#f3f4f6] p-4 border-l-4 border-[#663366] mb-6">
           <p className="text-xs text-gray-500 uppercase font-bold mb-1">Jouw Doel</p>
           <p className="text-gray-900 font-medium">{goal}</p>
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border border-gray-300 mb-6">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-[#663366] mb-1">Wat ga je doen?</label>
              <input 
                type="text" 
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStep()}
                className="w-full px-3 py-2 border border-gray-300 focus:border-[#663366] outline-none text-sm"
                placeholder="Bijv: Alinea 1 t/m 3 lezen..."
              />
            </div>
            <div className="flex gap-3">
              <div className="w-24">
                <label className="block text-xs font-bold text-[#663366] mb-1">Tijd (min)</label>
                <input 
                  type="number" 
                  value={newStepTime}
                  onChange={(e) => setNewStepTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 focus:border-[#663366] outline-none text-sm"
                />
              </div>
              <div className="flex-1 flex items-end">
                <Button variant="secondary" onClick={() => addStep()} disabled={!newStepText} className="w-full h-[38px] text-sm">
                  + Voeg stap toe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan List */}
        <div className="space-y-3 mb-6 min-h-[100px]">
          {steps.length === 0 ? (
            <p className="text-center text-gray-400 italic py-4">Je planning is nog leeg. Voeg hierboven stappen toe.</p>
          ) : (
            steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 shadow-sm group hover:border-[#663366] transition-colors">
                
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 mr-2 opacity-50 hover:opacity-100">
                  <button 
                    onClick={() => moveStep(index, 'up')} 
                    disabled={index === 0}
                    className="hover:text-[#663366] disabled:opacity-20"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button 
                    onClick={() => moveStep(index, 'down')} 
                    disabled={index === steps.length - 1}
                    className="hover:text-[#663366] disabled:opacity-20"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>

                <span className="w-8 h-8 flex items-center justify-center bg-[#663366] text-white font-bold text-sm shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{step.description}</p>
                  <p className="text-xs text-gray-500">{step.durationMinutes} minuten</p>
                </div>
                <button 
                  onClick={() => removeStep(step.id)}
                  className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Total Time */}
        {steps.length > 0 && (
           <div className="flex justify-end text-sm text-[#663366] font-bold border-t border-gray-100 pt-3 mb-6">
             Totaal gepland: {Math.floor(totalTime / 60)}u {totalTime % 60}m
           </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>Annuleer</Button>
          <Button variant="primary" onClick={() => onSave(steps)} disabled={steps.length === 0} className="flex-1">
            Planning Opslaan & Starten
          </Button>
        </div>
      </div>

      {/* Sidebar: AI Coach Assistant */}
      <div className="md:w-80 flex flex-col gap-4">
        
        {/* Avatar Area */}
        <AvatarCoach 
          message={
            analysis 
              ? (analysis.isValid 
                  ? `Ziet er goed uit!\n\n${analysis.feedback}` 
                  : `Ho even! Hier moeten we nog aan sleutelen.\n\n${analysis.feedback}\n\nTip: ${analysis.tip}`)
              : "Hulp nodig bij je planning? Ik ben er om kritisch mee te kijken!"
          } 
        />

        {/* Tools */}
        <div className="bg-white p-6 shadow-md border-t-4 border-[#00c7b1]">
           <h3 className="font-bold text-[#663366] mb-3">Coach Tools</h3>
           
           <div className="space-y-3">
             {tips.length === 0 ? (
               <Button variant="outline" onClick={handleGetTips} isLoading={isLoadingTips} className="w-full text-xs">
                 💡 Geef me 3 ideeën
               </Button>
             ) : (
               <div className="space-y-2">
                 <p className="text-xs font-bold text-gray-500">Klik om toe te voegen:</p>
                 {tips.map((tip, idx) => (
                   <button 
                    key={idx}
                    onClick={() => setNewStepText(tip)}
                    className="w-full text-left p-2 bg-gray-50 text-xs text-gray-700 border border-gray-200 hover:border-[#663366] transition-all"
                   >
                     + {tip}
                   </button>
                 ))}
               </div>
             )}

             <div className="h-px bg-gray-200 my-2"></div>

             <Button 
              variant="secondary" 
              onClick={handleCheckPlan} 
              disabled={steps.length < 1} 
              isLoading={isChecking}
              className="w-full text-xs"
             >
               🛡️ Check kwaliteit planning
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

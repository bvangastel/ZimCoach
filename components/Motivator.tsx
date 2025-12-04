
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getMotivationBoost } from '../services/gemini';
import { PlanStep } from '../types';
import { generateGoogleCalendarUrl, downloadIcsFile, generateOutlookWebUrl } from '../utils/calendar';
import { AvatarCoach } from './AvatarCoach';

interface MotivatorProps {
  goal: string;
  plan: PlanStep[];
  onUpdateProgress: (plan: PlanStep[]) => void;
  onBack: () => void;
  onHighMotivation: () => void;
  onCompleteTask: () => void;
  onStartReflection: () => void;
  onEditPlan: () => void;
  readOnly?: boolean;
}

export const Motivator: React.FC<MotivatorProps> = ({ 
  goal, 
  plan, 
  onUpdateProgress, 
  onBack, 
  onHighMotivation,
  onCompleteTask,
  onStartReflection,
  onEditPlan,
  readOnly = false
}) => {
  const [mood, setMood] = useState(5);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'MOOD' | 'SET_DATES' | 'TIMELINE'>('MOOD');

  // Determine initial state based on data completeness
  useEffect(() => {
    if (readOnly) {
      setViewMode('TIMELINE');
      setBoostMessage("Hier kun je terugzien wat je hebt gedaan. Klik op reflectie om je evaluatie te zien.");
      return;
    }

    const hasStarted = plan.some(s => s.completed);
    const hasDates = plan.every(s => !!s.targetDate);

    if (hasStarted || hasDates) {
      if (viewMode === 'MOOD') {
         // If we have dates/progress but are in Mood state, verify where to go
         setViewMode(hasDates ? 'TIMELINE' : 'SET_DATES');
         if (!boostMessage) setBoostMessage("Welkom terug! Laten we verder gaan.");
      }
    }
  }, [plan, readOnly, viewMode, boostMessage]);

  const handleGetBoost = async () => {
    setIsLoading(true);
    if (mood >= 8) onHighMotivation();
    const msg = await getMotivationBoost(goal, mood);
    setBoostMessage(msg);
    setIsLoading(false);
    
    // Check if we need to set dates first
    const hasAllDates = plan.every(s => !!s.targetDate);
    setViewMode(hasAllDates ? 'TIMELINE' : 'SET_DATES');
  };

  const toggleStep = (id: string) => {
    if (readOnly) return;
    const updatedPlan = plan.map(s => {
      if (s.id === id) {
        if (!s.completed) onCompleteTask();
        return { ...s, completed: !s.completed };
      }
      return s;
    });
    onUpdateProgress(updatedPlan);
  };

  const updateDate = (id: string, date: string) => {
    if (readOnly) return;
    const updatedPlan = plan.map(s => s.id === id ? { ...s, targetDate: date } : s);
    onUpdateProgress(updatedPlan);
  };

  const handleConfirmDates = () => {
    setViewMode('TIMELINE');
    // Re-sort plan based on new dates?
    // We update parent state, UI will re-render. 
    // Ideally we might want to sort the plan in the parent, but display sort is enough here.
  };

  const allDone = plan.length > 0 && plan.every(s => s.completed);
  const allDatesSet = plan.every(s => !!s.targetDate);

  // Sorted plan for timeline view
  const sortedPlan = [...plan].sort((a, b) => {
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });

  if (viewMode === 'MOOD') {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 shadow-md border-t-4 border-[#663366] animate-fade-in-up">
         <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-[#663366]">Motivatie Check</h2>
        </div>

        <AvatarCoach message="Hoe zeker voel je je dat je dit doel gaat halen? (Self-Efficacy)" className="mb-6" />

        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Niet zeker</span>
            <span>Heel zeker</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={mood} 
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#663366]"
          />
          <div className="text-center mt-4">
            <span className="text-3xl font-bold text-[#663366]">{mood}</span>
            <span className="text-gray-400 text-lg">/10</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>Later</Button>
          <Button 
            variant="primary" 
            onClick={handleGetBoost} 
            isLoading={isLoading}
            className="flex-1"
          >
            Aan de slag!
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'SET_DATES') {
     return (
       <div className="max-w-4xl mx-auto animate-fade-in-up">
         <div className="bg-white p-8 shadow-md border-t-4 border-[#663366] mb-6">
           <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-[#663366]">Stap 1: Planning & Deadlines</h2>
              <button onClick={onEditPlan} className="text-xs text-gray-500 hover:text-[#663366] underline">
                Wijzig Acties
              </button>
           </div>

           <AvatarCoach message={boostMessage || "Laten we concreet worden. Wanneer wil je elke stap afgerond hebben?"} className="mb-8" />

           <div className="space-y-4 mb-8">
             {plan.map((step, idx) => (
               <div key={step.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-gray-200 bg-gray-50">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#663366] text-white font-bold rounded-full text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{step.description}</p>
                    <p className="text-xs text-gray-500">{step.durationMinutes} minuten</p>
                  </div>
                  <div className="md:w-48">
                    <label className="block text-xs font-bold text-[#663366] mb-1">Deadline:</label>
                    <input 
                       type="date"
                       value={step.targetDate || ''}
                       onChange={(e) => updateDate(step.id, e.target.value)}
                       className={`w-full p-2 border text-sm outline-none transition-all ${
                         !step.targetDate ? 'border-orange-300 bg-orange-50' : 'border-green-300 bg-white'
                       }`}
                    />
                  </div>
               </div>
             ))}
           </div>

           <div className="flex justify-end">
             <Button 
               variant="primary" 
               onClick={handleConfirmDates} 
               disabled={!allDatesSet}
               className={!allDatesSet ? 'opacity-50' : ''}
             >
               {allDatesSet ? 'Maak Tijdlijn & Start' : 'Vul alle datums in'}
             </Button>
           </div>
         </div>
       </div>
     );
  }

  // TIMELINE VIEW
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-white p-6 shadow-md border-t-4 border-[#663366] mb-6">
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-[#663366]">Uitvoering Tijdlijn</h2>
            {!readOnly && (
              <button onClick={() => setViewMode('SET_DATES')} className="text-xs text-gray-500 hover:text-[#663366] underline">
                Wijzig Datums
              </button>
            )}
        </div>

        <AvatarCoach message={readOnly ? (boostMessage || "Terugblik modus.") : "Hier is je tijdlijn. Zet acties in je agenda en vink ze af als je klaar bent!"} className="mb-6" />

        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-8">
          {sortedPlan.map((step, idx) => {
            const dateObj = step.targetDate ? new Date(step.targetDate) : null;
            const dateStr = dateObj ? dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : 'Geen datum';
            
            return (
              <div key={step.id} className="relative pl-8">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                  step.completed ? 'bg-green-500 border-green-500' : 'bg-white border-[#663366]'
                }`}></div>

                <div className={`p-4 border shadow-sm transition-all ${
                   step.completed 
                   ? 'bg-green-50 border-green-200' 
                   : 'bg-white border-gray-200 hover:border-[#663366]'
                }`}>
                   <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <span className="text-xs font-bold text-[#663366] uppercase tracking-wide mb-1 block">
                          {dateStr}
                        </span>
                        <h4 className={`font-bold text-lg ${step.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {step.description}
                        </h4>
                        <span className="text-xs text-gray-500 block mt-1">{step.durationMinutes} min</span>
                      </div>
                      
                      {/* Checkbox Action */}
                      {!readOnly && (
                        <button 
                          onClick={() => toggleStep(step.id)}
                          className={`px-4 py-2 rounded font-bold text-sm transition-colors border ${
                            step.completed 
                              ? 'bg-white text-green-600 border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200' 
                              : 'bg-[#663366] text-white border-[#663366] hover:bg-[#502050]'
                          }`}
                        >
                          {step.completed ? 'Voltooid ✓' : 'Afronden'}
                        </button>
                      )}
                      {readOnly && step.completed && <span className="text-green-600 font-bold">✓ Voltooid</span>}
                   </div>

                   {/* Agenda Buttons */}
                   {(!step.completed && !readOnly) && (
                     <div className="flex gap-2 border-t border-gray-100 pt-3">
                        <span className="text-xs text-gray-400 self-center mr-2">Zet in agenda:</span>
                        <button 
                            onClick={() => downloadIcsFile(step, goal)}
                            className="text-[10px] bg-gray-50 text-gray-700 px-2 py-1 border border-gray-200 hover:bg-gray-100 rounded"
                        >
                            📅 Outlook App / Apple
                        </button>
                        <a 
                            href={generateOutlookWebUrl(step, goal)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 border border-blue-200 hover:bg-blue-100 rounded"
                        >
                            Outlook Web
                        </a>
                        <a 
                            href={generateGoogleCalendarUrl(step, goal)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] bg-red-50 text-red-700 px-2 py-1 border border-red-200 hover:bg-red-100 rounded"
                        >
                            Google
                        </a>
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          {allDone ? (
              readOnly ? (
                <div className="bg-green-50 p-4 text-center border border-green-200">
                   <p className="text-green-800 font-bold mb-2">Dit doel is afgerond.</p>
                   <Button variant="secondary" onClick={onStartReflection} className="mx-auto">
                      Bekijk Reflectie
                   </Button>
                </div>
              ) : (
                <div className="bg-green-50 p-6 text-center border border-green-200 animate-fade-in">
                    <h3 className="text-green-800 font-bold mb-2 text-xl">Geweldig gedaan! Alles is afgerond.</h3>
                    <p className="text-sm text-green-700 mb-4">Je bent klaar voor de laatste stap.</p>
                    <Button variant="secondary" onClick={onStartReflection} className="w-full">
                        Start Reflectie
                    </Button>
                </div>
              )
          ) : (
              !readOnly && (
                <div className="bg-gray-50 p-4 text-center border border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">Vink alle taken af in de tijdlijn hierboven.</p>
                    <Button variant="outline" onClick={onBack} className="w-full">
                        Opslaan & Terug naar Dashboard
                    </Button>
                </div>
              )
          )}
           {readOnly && (
              <Button variant="outline" onClick={onBack} className="w-full mt-4">Terug naar Dashboard</Button>
           )}
        </div>
      </div>
    </div>
  );
};

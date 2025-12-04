
import React, { useState } from 'react';
import { Button } from './Button';
import { analyzeGoal } from '../services/gemini';
import { SmartGoalAnalysis, LearningStrategy } from '../types';
import { AvatarCoach } from './AvatarCoach';

interface GoalSetterProps {
  onNext: (goal: string, strategy: LearningStrategy, shortTitle?: string) => void;
  onSmartGoalAchieved: () => void;
  onCancel: () => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ onNext, onSmartGoalAchieved, onCancel }) => {
  const [inputGoal, setInputGoal] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<LearningStrategy | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SmartGoalAnalysis | null>(null);
  const [smartBonusAwarded, setSmartBonusAwarded] = useState(false);

  const strategies = [
    { id: LearningStrategy.MEMORIZE, label: 'Onthouden', desc: 'Feiten stampen, definities leren', icon: '🧠' },
    { id: LearningStrategy.UNDERSTAND, label: 'Begrijpen', desc: 'Samenvatten, in eigen woorden zetten', icon: '💡' },
    { id: LearningStrategy.APPLY, label: 'Toepassen', desc: 'Oefenen, casussen uitwerken', icon: '🛠️' },
    { id: LearningStrategy.ANALYZE, label: 'Analyseren', desc: 'Verbanden leggen, onderzoeken', icon: '🔍' },
  ];

  const handleAnalyze = async () => {
    if (!inputGoal.trim() || !selectedStrategy) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeGoal(inputGoal, selectedStrategy);
      setAnalysis(result);
      
      if (result.isSmart && !smartBonusAwarded) {
        onSmartGoalAchieved();
        setSmartBonusAwarded(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useSuggestion = () => {
    if (analysis?.suggestion) {
      setInputGoal(analysis.suggestion);
      // We keep the analysis object but maybe clear invalid flags if we re-analyzed? 
      // For now simple UX: just replace text.
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-md border-t-4 border-[#663366] animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#663366]">Doel & Strategie</h2>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-[#663366]">✕</button>
      </div>

      <AvatarCoach 
        message={analysis 
          ? (analysis.isSmart 
              ? `Fantastisch! Dit is een sterk SMART doel.\n\n${analysis.feedback}\n\n${analysis.strategyAdvice || ''}` 
              : `Goed begin, maar we kunnen het nog iets scherper maken.\n\n${analysis.feedback}`)
          : "Hoi! Ik ben ZimCoach. \n\nOm te beginnen: Wat wil je bereiken? Kies eerst een strategie en typ dan je leerdoel."
        }
        className="mb-8"
      />

      {/* Strategy Selector */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-[#663366] mb-3">1. Kies je leerstrategie</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strategies.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedStrategy(s.id); setAnalysis(null); }}
              className={`p-3 border text-left transition-all flex items-start gap-3 ${
                selectedStrategy === s.id 
                  ? 'border-[#663366] bg-[#f3eaf3] ring-1 ring-[#663366]' 
                  : 'border-gray-200 hover:border-[#663366] hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`font-bold text-sm ${selectedStrategy === s.id ? 'text-[#663366]' : 'text-gray-800'}`}>{s.label}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="goal" className="block text-sm font-bold text-[#663366] mb-2">2. Jouw SMART doel</label>
        <textarea
          id="goal"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 focus:border-[#663366] focus:ring-1 focus:ring-[#663366] outline-none transition-all resize-none"
          placeholder="Bijv: Ik wil hoofdstuk 3 van mijn marketingboek samenvatten in max 2 pagina's binnen 2 uur."
          value={inputGoal}
          onChange={(e) => setInputGoal(e.target.value)}
        />
      </div>

      {analysis && !analysis.isSmart && (
         <div className="mb-6 ml-4 pl-4 border-l-2 border-orange-300">
           <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Suggestie:</p>
           <p className="text-gray-800 italic text-sm mt-1">"{analysis.suggestion}"</p>
           <button onClick={useSuggestion} className="text-sm text-[#663366] font-bold mt-2 hover:underline">
             Gebruik deze suggestie
           </button>
         </div>
      )}

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={handleAnalyze} 
          isLoading={isAnalyzing}
          disabled={!inputGoal || !selectedStrategy}
          className="flex-1"
        >
          Check met ZimCoach
        </Button>
        <Button 
          variant="primary" 
          onClick={() => selectedStrategy && onNext(inputGoal, selectedStrategy, analysis?.shortTitle)} 
          disabled={inputGoal.length < 5 || !selectedStrategy || isAnalyzing}
          className="flex-1"
        >
          Naar Planning
        </Button>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from './Button';
import { analyzeReflection } from '../services/gemini';
import { LearningStrategy, ReflectionMethod } from '../types';
import { AvatarCoach } from './AvatarCoach';

interface ReflectorProps {
  goal: string;
  strategy: LearningStrategy;
  onFinish: (feedback: string, reflectionText: string, method: ReflectionMethod) => void;
  onCycleCompleted: () => void;
  readOnly?: boolean;
  savedReflection?: { text: string; feedback?: string; method?: ReflectionMethod };
}

export const Reflector: React.FC<ReflectorProps> = ({ 
  goal, 
  strategy, 
  onFinish, 
  onCycleCompleted, 
  readOnly = false,
  savedReflection
}) => {
  const [method, setMethod] = useState<ReflectionMethod | null>(null);
  const [reflectionData, setReflectionData] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const methods = [
    { 
      id: ReflectionMethod.STARR, 
      title: 'STARR Methode', 
      desc: 'Situatie, Taak, Actie, Resultaat, Reflectie. Goed voor concrete situaties.',
      fields: ['Situatie', 'Taak', 'Actie', 'Resultaat', 'Reflectie']
    },
    { 
      id: ReflectionMethod.KORTHAGEN, 
      title: 'Cyclus van Korthagen', 
      desc: 'Handelen -> Terugblikken -> Bewustwording -> Alternatieven.',
      fields: ['Wat wilde ik bereiken?', 'Wat gebeurde er?', 'Wat dacht/voelde ik?', 'Wat neem ik mee?']
    },
    { 
      id: ReflectionMethod.FOUR_LS, 
      title: 'De 4 L\'s', 
      desc: 'Liked, Learned, Lacked, Longed For. Snel en agile.',
      fields: ['Liked (Wat ging goed?)', 'Learned (Wat geleerd?)', 'Lacked (Wat miste ik?)', 'Longed For (Wat wil ik volgende keer?)']
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setReflectionData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (Object.values(reflectionData).join('').length < 20) return;
    setIsLoading(true);
    
    const fullText = Object.entries(reflectionData).map(([k, v]) => `${k}: ${v}`).join('\n');
    const res = await analyzeReflection(goal, fullText, strategy);
    
    setFeedback(res);
    onCycleCompleted();
    setIsLoading(false);
  };

  const handleFinalize = () => {
    if (feedback && method) {
        const fullText = Object.entries(reflectionData).map(([k, v]) => `${k}: ${v}`).join('\n');
        onFinish(feedback, fullText, method);
    } else {
        // Fallback
        onFinish(feedback || '', '', ReflectionMethod.STARR);
    }
  };

  // View: Read Only (History)
  if (readOnly && savedReflection) {
    return (
       <div className="max-w-3xl mx-auto bg-white p-8 shadow-md border-t-4 border-gray-400 animate-fade-in-up">
           <h2 className="text-2xl font-bold text-gray-500 mb-6 flex items-center gap-2">
             <span>📂</span> Archief: Reflectie
           </h2>

           <AvatarCoach message={savedReflection.feedback || "Geen feedback opgeslagen."} className="mb-8" />

           <div className="bg-gray-50 p-6 border border-gray-200">
             <h3 className="font-bold text-[#663366] mb-4 border-b border-gray-200 pb-2">
                Jouw Reflectie ({savedReflection.method})
             </h3>
             <p className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
               {savedReflection.text}
             </p>
           </div>
           
           <Button variant="outline" onClick={() => onFinish('', '', ReflectionMethod.STARR)} className="mt-8 w-full">
             Terug naar Dashboard
           </Button>
       </div>
    );
  }

  // View: Feedback Received
  if (feedback) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 shadow-md border-t-4 border-[#00c7b1] animate-fade-in-up">
         <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#663366] mb-2">Cyclus Voltooid!</h2>
            <p className="text-gray-500">ZimCoach heeft je proces geanalyseerd.</p>
         </div>

         <AvatarCoach message={feedback} />

         <Button variant="primary" onClick={handleFinalize} className="mx-auto px-8 w-full">
           Afronden & Naar Dashboard
         </Button>
      </div>
    );
  }

  // View: Method Selection
  if (!method) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 shadow-md border-t-4 border-[#663366] animate-fade-in-up">
         <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-[#663366]">Reflectie (Self-Reflection)</h2>
         </div>

         <AvatarCoach 
            message="Je bent er bijna! Laten we terugkijken zodat je de volgende keer nóg beter leert. Kies een manier die bij jou past." 
            className="mb-8"
         />

         <div className="grid md:grid-cols-3 gap-4">
           {methods.map(m => (
             <button
               key={m.id}
               onClick={() => setMethod(m.id)}
               className="p-4 border-2 border-gray-200 hover:border-[#663366] hover:bg-[#f3eaf3] text-left transition-all rounded-lg group h-full flex flex-col"
             >
               <h3 className="font-bold text-[#663366] mb-2 group-hover:scale-105 transition-transform">{m.title}</h3>
               <p className="text-xs text-gray-500">{m.desc}</p>
             </button>
           ))}
         </div>
      </div>
    );
  }

  // View: Filling in the Form
  const selectedMethod = methods.find(m => m.id === method);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 shadow-md border-t-4 border-[#663366] animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#663366]">Reflectie: {selectedMethod?.title}</h2>
        <button onClick={() => setMethod(null)} className="text-xs text-gray-400 underline">Kies andere methode</button>
      </div>

      <p className="text-gray-600 mb-6">
        Je hebt de strategie <strong>{strategy}</strong> gebruikt. Vul de velden in om je proces te analyseren.
      </p>

      <div className="space-y-5 mb-8">
        {selectedMethod?.fields.map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-bold text-gray-700 mb-2">{field}</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 focus:border-[#663366] outline-none transition-all resize-none text-sm bg-gray-50 focus:bg-white"
              value={reflectionData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="..."
            />
          </div>
        ))}
      </div>

      <Button 
        variant="primary" 
        onClick={handleSubmit} 
        isLoading={isLoading} 
        className="w-full"
      >
        Vraag ZimCoach Feedback
      </Button>
    </div>
  );
};

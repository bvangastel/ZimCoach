
import React from 'react';
import { Goal, GoalStatus } from '../types';
import { Button } from './Button';

interface DashboardProps {
  goals: Goal[];
  onNewGoal: () => void;
  onOpenGoal: (goalId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ goals, onNewGoal, onOpenGoal }) => {
  const activeGoals = goals.filter(g => g.status !== GoalStatus.COMPLETED);
  const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-6 border-gray-200">
        <div>
           <h1 className="text-3xl font-bold text-[#663366]">Mijn Studie Dashboard</h1>
           <p className="text-gray-500">Beheer je leerdoelen en voortgang.</p>
        </div>
        
        {activeGoals.length < 5 ? (
          <Button variant="secondary" onClick={onNewGoal}>
            + Nieuw Leerdoel
          </Button>
        ) : (
          <div className="bg-orange-50 text-orange-800 px-4 py-2 border border-orange-200 text-sm font-medium">
             Max. 5 actieve doelen bereikt. Rond er eerst één af.
          </div>
        )}
      </div>

      {/* Active Goals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {activeGoals.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4 grayscale opacity-50">🚀</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nog geen doelen</h3>
            <p className="text-gray-500 mb-6">Start een nieuwe studiecyclus om te beginnen.</p>
            <Button variant="primary" onClick={onNewGoal}>Start Nu</Button>
          </div>
        )}

        {activeGoals.map(goal => (
          <div key={goal.id} className="bg-white shadow-sm border-t-4 border-[#663366] p-6 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-md h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-[#f3f4f6] text-[#663366] text-xs font-bold px-2 py-1 uppercase tracking-wide border border-gray-200">
                {goal.strategy}
              </span>
              {goal.status === GoalStatus.READY_FOR_REFLECTION && (
                 <span className="bg-[#00c7b1] text-white text-xs font-bold px-2 py-1 animate-pulse rounded-sm">
                   Reflecteren!
                 </span>
              )}
            </div>
            
            {/* Display Short Title prominently, fallback to truncation */}
            <h3 className="font-bold text-xl text-[#663366] mb-2 leading-tight">
              {goal.shortTitle || goal.title.split(' ').slice(0, 5).join(' ') + '...'}
            </h3>
            
            {/* Full description in smaller text */}
            <p className="text-xs text-gray-500 mb-4 line-clamp-2 h-[2.5em]" title={goal.title}>
               {goal.title}
            </p>
            
            <div className="mb-6 mt-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Voortgang</span>
                <span>{Math.round(goal.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 overflow-hidden rounded-full">
                <div 
                  className={`h-full transition-all duration-500 ${
                    goal.status === GoalStatus.READY_FOR_REFLECTION ? 'bg-[#00c7b1]' : 'bg-[#663366]'
                  }`} 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            <Button 
              variant={goal.status === GoalStatus.READY_FOR_REFLECTION ? 'secondary' : 'outline'}
              onClick={() => onOpenGoal(goal.id)}
              className="w-full"
            >
              {goal.status === GoalStatus.READY_FOR_REFLECTION ? 'Start Reflectie' : 'Naar Acties'}
            </Button>
          </div>
        ))}
      </div>

      {/* Completed History */}
      {completedGoals.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
           <h2 className="text-xl font-bold text-gray-800 mb-6">Archief (Voltooid)</h2>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-85">
             {completedGoals.map(goal => (
               <button 
                key={goal.id} 
                onClick={() => onOpenGoal(goal.id)}
                className="bg-gray-50 border border-gray-200 p-5 text-left hover:bg-white hover:border-[#663366] transition-all group"
               >
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-bold text-gray-500">{new Date(goal.createdAt).toLocaleDateString()}</span>
                   <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 border border-green-100">✓ 100%</span>
                 </div>
                 <h4 className="font-bold text-gray-800 mb-1 group-hover:text-[#663366]">
                    {goal.shortTitle || goal.title.split(' ').slice(0, 5).join(' ')}
                 </h4>
                 <div className="text-sm text-gray-500">Strategie: {goal.strategy}</div>
                 <div className="mt-4 text-xs text-gray-400 underline decoration-dotted">Klik om terug te kijken</div>
               </button>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

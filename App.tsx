
import React, { useState } from 'react';
import { ProgressBar } from './components/ProgressBar';
import { GoalSetter } from './components/GoalSetter';
import { Planner } from './components/Planner';
import { Motivator } from './components/Motivator';
import { Reflector } from './components/Reflector';
import { Achievements } from './components/Achievements';
import { Dashboard } from './components/Dashboard';
import { AppPhase, PlanStep, UserProfile, Achievement, LearningStrategy, Goal, GoalStatus, ReflectionMethod } from './types';

// Default badges configuration
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_cycle', title: 'Beginner', description: 'Voltooi je eerste studiecyclus', icon: '🌱', unlocked: false, points: 50 },
  { id: 'smart_cookie', title: 'SMART Cookie', description: 'Stel een perfect SMART doel op', icon: '🍪', unlocked: false, points: 30 },
  { id: 'high_energy', title: 'Powerhouse', description: 'Start een sessie met maximale motivatie', icon: '⚡', unlocked: false, points: 20 },
  { id: 'pro_planner', title: 'Zelfregulator', description: 'Voltooi 3 volledige cycli', icon: '🧠', unlocked: false, points: 150 },
  { id: 'task_master', title: 'Taakmeester', description: 'Voltooi 10 taken', icon: '✅', unlocked: false, points: 50 },
];

const INITIAL_PROFILE: UserProfile = {
  points: 0,
  level: 1,
  completedCycles: 0,
  achievements: DEFAULT_ACHIEVEMENTS
};

function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [phase, setPhase] = useState<AppPhase>(AppPhase.DASHBOARD);
  
  // Gamification State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [showProfile, setShowProfile] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Computed: Get Current Goal Object
  const activeGoal = goals.find(g => g.id === activeGoalId);

  const addPoints = (amount: number, reason?: string) => {
    setUserProfile(prev => {
      const newPoints = prev.points + amount;
      const newLevel = Math.floor(newPoints / 500) + 1;
      return {
        ...prev,
        points: newPoints,
        level: newLevel
      };
    });
    if (reason) showNotification(`+${amount} XP: ${reason}`);
  };

  const unlockBadge = (badgeId: string) => {
    setUserProfile(prev => {
      const badge = prev.achievements.find(a => a.id === badgeId);
      if (badge && !badge.unlocked) {
        showNotification(`🏆 Badge Ontgrendeld: ${badge.title}`);
        return {
          ...prev,
          points: prev.points + badge.points,
          achievements: prev.achievements.map(a => 
            a.id === badgeId ? { ...a, unlocked: true } : a
          )
        };
      }
      return prev;
    });
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Navigation Handlers ---

  const handleCreateNewGoal = () => {
    setPhase(AppPhase.GOAL_SETTING);
  };

  const handleOpenGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    setActiveGoalId(goalId);
    
    if (goal.status === GoalStatus.COMPLETED) {
      setPhase(AppPhase.MOTIVATION);
    } else if (goal.status === GoalStatus.READY_FOR_REFLECTION) {
      setPhase(AppPhase.REFLECTION);
    } else if (goal.plan.length === 0) {
      setPhase(AppPhase.PLANNING);
    } else {
      setPhase(AppPhase.MOTIVATION);
    }
  };

  const handleBackToDashboard = () => {
    setActiveGoalId(null);
    setPhase(AppPhase.DASHBOARD);
  };

  // --- Goal Process Handlers ---

  const handleGoalCreated = (title: string, strategy: LearningStrategy, shortTitle?: string) => {
    const newId = Date.now().toString();
    const newGoal: Goal = {
      id: newId,
      title,
      shortTitle, // Store the AI generated summary
      strategy,
      status: GoalStatus.ACTIVE,
      plan: [],
      progress: 0,
      createdAt: Date.now()
    };
    setGoals(prev => [...prev, newGoal]);
    setActiveGoalId(newId);
    setPhase(AppPhase.PLANNING);
  };

  const handlePlanSaved = (plan: PlanStep[]) => {
    if (!activeGoalId) return;
    setGoals(prev => prev.map(g => g.id === activeGoalId ? { ...g, plan } : g));
    setPhase(AppPhase.MOTIVATION);
  };

  const handleEditPlanFromMotivator = () => {
    setPhase(AppPhase.PLANNING);
  };

  const handleUpdateProgress = (updatedPlan: PlanStep[]) => {
    if (!activeGoalId) return;
    
    // Calculate progress
    const total = updatedPlan.length;
    const completed = updatedPlan.filter(s => s.completed).length;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    
    const allDone = completed === total && total > 0;

    setGoals(prev => prev.map(g => {
      if (g.id === activeGoalId) {
        return { 
          ...g, 
          plan: updatedPlan, 
          progress,
          status: allDone ? g.status === GoalStatus.COMPLETED ? GoalStatus.COMPLETED : GoalStatus.READY_FOR_REFLECTION : GoalStatus.ACTIVE
        };
      }
      return g;
    }));
  };

  const handleTaskComplete = () => {
    addPoints(10, "Taak Voltooid");
  };

  const handleSmartGoalAchieved = () => {
    addPoints(20, "SMART Doel");
    unlockBadge('smart_cookie');
  };

  const handleHighMotivation = () => {
    addPoints(10, "Hoge Motivatie");
    unlockBadge('high_energy');
  };

  const handleStartReflection = () => {
    setPhase(AppPhase.REFLECTION);
  };

  const handleFinishCycle = (feedback: string, reflectionText: string, method: ReflectionMethod) => {
    if (!activeGoalId) {
        handleBackToDashboard();
        return;
    }
    
    const goal = goals.find(g => g.id === activeGoalId);
    if (goal && goal.status !== GoalStatus.COMPLETED) {
        setGoals(prev => prev.map(g => 
            g.id === activeGoalId 
            ? { 
                ...g, 
                status: GoalStatus.COMPLETED, 
                progress: 100,
                reflectionFeedback: feedback,
                reflectionText: reflectionText,
                reflectionMethod: method
              } 
            : g
        ));
        handleCycleCompleted();
    }
    
    handleBackToDashboard();
  };

  const handleCycleCompleted = () => {
    addPoints(100, "Cyclus Voltooid");
    setUserProfile(prev => {
      const newCount = prev.completedCycles + 1;
      if (newCount === 1) setTimeout(() => unlockBadge('first_cycle'), 500);
      if (newCount === 3) setTimeout(() => unlockBadge('pro_planner'), 500);
      return { ...prev, completedCycles: newCount };
    });
  };

  return (
    <div className="min-h-screen pb-12 bg-[#ffffff]">
      <header className="bg-white border-b-4 border-[#663366] sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {/* Fontys-like logo block */}
            <div className="bg-[#663366] w-10 h-10 flex items-center justify-center text-white font-bold text-xl shadow-sm">F</div>
            <div className="flex flex-col items-start">
               <h1 className="text-xl font-bold text-[#663366] leading-none">ZimCoach</h1>
               <span className="text-xs text-gray-500 font-medium">Meester je Studie</span>
            </div>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#f3eaf3] hover:bg-[#e8dbe8] transition-colors"
            >
              <span className="text-lg">🏆</span>
              <span className="font-bold text-[#663366] text-sm">{userProfile.points} XP</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-4 bg-[#663366] text-white px-6 py-3 shadow-xl z-50 animate-bounce border-l-4 border-[#00c7b1]">
          {notification}
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <Achievements profile={userProfile} onClose={() => setShowProfile(false)} />
      )}

      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {phase === AppPhase.DASHBOARD && (
          <Dashboard 
            goals={goals} 
            onNewGoal={handleCreateNewGoal} 
            onOpenGoal={handleOpenGoal}
          />
        )}

        {phase !== AppPhase.DASHBOARD && (
          <div className="mb-6">
             <ProgressBar currentPhase={phase} />
          </div>
        )}

        <div className="transition-all duration-500">
          {phase === AppPhase.GOAL_SETTING && (
            <GoalSetter 
              onNext={handleGoalCreated} 
              onSmartGoalAchieved={handleSmartGoalAchieved}
              onCancel={handleBackToDashboard}
            />
          )}

          {phase === AppPhase.PLANNING && activeGoal && (
            <Planner 
              goal={activeGoal.title} 
              strategy={activeGoal.strategy}
              initialPlan={activeGoal.plan}
              onSave={handlePlanSaved} 
              onBack={handleBackToDashboard} 
            />
          )}

          {phase === AppPhase.MOTIVATION && activeGoal && (
            <Motivator 
              goal={activeGoal.title}
              plan={activeGoal.plan}
              onUpdateProgress={handleUpdateProgress}
              onBack={handleBackToDashboard}
              onHighMotivation={handleHighMotivation}
              onCompleteTask={handleTaskComplete}
              onStartReflection={handleStartReflection}
              onEditPlan={handleEditPlanFromMotivator}
              readOnly={activeGoal.status === GoalStatus.COMPLETED}
            />
          )}

          {phase === AppPhase.REFLECTION && activeGoal && (
            <Reflector 
              goal={activeGoal.title} 
              strategy={activeGoal.strategy}
              onFinish={handleFinishCycle} 
              onCycleCompleted={() => {}}
              readOnly={activeGoal.status === GoalStatus.COMPLETED}
              savedReflection={
                activeGoal.status === GoalStatus.COMPLETED 
                ? { 
                    text: activeGoal.reflectionText || '', 
                    feedback: activeGoal.reflectionFeedback,
                    method: activeGoal.reflectionMethod
                  } 
                : undefined
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

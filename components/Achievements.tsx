import React from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';

interface AchievementsProps {
  profile: UserProfile;
  onClose: () => void;
}

export const Achievements: React.FC<AchievementsProps> = ({ profile, onClose }) => {
  const nextLevelPoints = (profile.level + 1) * 500;
  const progress = (profile.points % 500) / 500 * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-8 border-[#663366]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-[#663366] flex items-center gap-2">
            <span>🏆</span> Jouw Profiel
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#663366] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Header Stats */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-[#f3eaf3] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
              <span className="text-4xl font-bold text-[#663366]">{profile.level}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Level {profile.level} Student</h3>
            <p className="text-gray-500 mb-6">{profile.points} XP Totaal</p>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-gray-200 h-4 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-[#663366] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Nog {nextLevelPoints - profile.points} XP tot level {profile.level + 1}
            </p>
          </div>

          {/* Badges Grid */}
          <h4 className="text-lg font-bold text-gray-800 mb-4">Badges & Prestaties</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.achievements.map((badge) => (
              <div 
                key={badge.id}
                className={`p-4 border-2 flex items-center gap-4 transition-all ${
                  badge.unlocked 
                    ? 'border-[#663366] bg-[#f3eaf3]' 
                    : 'border-gray-100 bg-gray-50 opacity-50 grayscale'
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center text-2xl shrink-0 ${
                  badge.unlocked ? 'bg-white shadow-sm' : 'bg-gray-200'
                }`}>
                  {badge.icon}
                </div>
                <div>
                  <h5 className={`font-bold ${badge.unlocked ? 'text-[#663366]' : 'text-gray-500'}`}>
                    {badge.title}
                  </h5>
                  <p className="text-xs text-gray-500 leading-tight mb-1">{badge.description}</p>
                  {badge.unlocked && (
                    <span className="text-[10px] font-bold text-white bg-[#00c7b1] px-2 py-0.5">
                      +{badge.points} XP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button onClick={onClose} variant="outline">Sluiten</Button>
        </div>
      </div>
    </div>
  );
};
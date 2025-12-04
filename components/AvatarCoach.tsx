
import React from 'react';

interface AvatarCoachProps {
  message: string;
  mood?: number;
  className?: string;
}

export const AvatarCoach: React.FC<AvatarCoachProps> = ({ message, mood, className = '' }) => {
  return (
    <div className={`flex items-start gap-4 animate-fade-in ${className}`}>
      <div className="flex-shrink-0 flex flex-col items-center group">
        {/* Animated Avatar */}
        <div className="w-20 h-20 rounded-full bg-[#f3eaf3] border-2 border-[#663366] relative overflow-hidden shadow-md">
          <svg viewBox="0 0 100 100" className="w-full h-full avatar-head">
             {/* Background Hair (Bun/Back) */}
             <g className="avatar-hair-back">
                {/* Main volume behind head */}
                <path d="M15,50 Q15,10 50,10 Q85,10 85,50 L85,90 L15,90 Z" fill="#4a3b4a" />
                {/* Bun detail */}
                <circle cx="50" cy="12" r="14" fill="#4a3b4a" />
             </g>

            {/* Face Group - Moves independently */}
            <g className="avatar-face">
                {/* Face Shape */}
                <path d="M28,45 Q28,88 50,88 Q72,88 72,45 Q72,25 50,25 Q28,25 28,45" fill="#f5d0b0" />

                {/* Ears */}
                <path d="M22,55 Q22,45 28,50" fill="#f5d0b0" />
                <path d="M78,55 Q78,45 72,50" fill="#f5d0b0" />

                {/* Hair Front (Natural Hairline) */}
                {/* Starts at left ear, curves over top, comes down to right, sweeps back across forehead */}
                <path d="M24,55 C24,15 76,15 76,55 Q50,32 24,55" fill="#4a3b4a" />

                {/* Eyes Container */}
                <g className="avatar-eyes-container">
                    <g className="avatar-eyes">
                    <ellipse cx="42" cy="55" rx="3.5" ry="4.5" fill="#333" />
                    <ellipse cx="58" cy="55" rx="3.5" ry="4.5" fill="#333" />
                    {/* Eye sparkle */}
                    <circle cx="43" cy="53" r="1" fill="white" />
                    <circle cx="59" cy="53" r="1" fill="white" />
                    </g>
                    
                    {/* Pupils for tracking effect */}
                    <g className="avatar-pupils">
                       <circle cx="42" cy="55" r="1.5" fill="#000" opacity="0.5" />
                       <circle cx="58" cy="55" r="1.5" fill="#000" opacity="0.5" />
                    </g>
                </g>

                {/* Glasses */}
                <g stroke="#663366" strokeWidth="1.5" fill="none" opacity="0.9" className="avatar-glasses">
                <path d="M34,55 Q42,60 50,55 Q58,60 66,55" />
                <circle cx="42" cy="55" r="7" />
                <circle cx="58" cy="55" r="7" />
                <line x1="49" y1="55" x2="51" y2="55" />
                </g>

                {/* Smile */}
                <path d="M42,70 Q50,76 58,70" stroke="#a65d5d" strokeWidth="2" strokeLinecap="round" fill="none" />
                
                {/* Cheeks */}
                <circle cx="36" cy="66" r="3.5" fill="#ffb6c1" opacity="0.5" />
                <circle cx="64" cy="66" r="3.5" fill="#ffb6c1" opacity="0.5" />
            </g>
          </svg>
          <style>{`
            .avatar-head {
              /* General float */
            }
            .avatar-face {
              animation: headBob 6s ease-in-out infinite alternate;
              transform-origin: 50% 85%;
            }
            .avatar-eyes {
              animation: blink 4.5s infinite;
            }
            .avatar-pupils {
               animation: lookAround 8s infinite;
            }
            
            @keyframes headBob {
              0% { transform: rotate(0deg) translateY(0); }
              33% { transform: rotate(2deg) translateY(1px); }
              66% { transform: rotate(-1deg) translateY(0.5px); }
              100% { transform: rotate(0deg) translateY(0); }
            }

            @keyframes blink {
              0%, 96%, 100% { transform: scaleY(1); }
              98% { transform: scaleY(0.1); transform-origin: center 55px; }
            }

            @keyframes lookAround {
               0%, 40% { transform: translateX(0); }
               45% { transform: translateX(2px); }
               55% { transform: translateX(2px); }
               60% { transform: translateX(0); }
               80% { transform: translateX(-1.5px); }
               90% { transform: translateX(0); }
            }
          `}</style>
        </div>
        
        {mood !== undefined && (
          <div className="mt-2 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
            <span className="text-[10px] font-bold text-[#663366] uppercase tracking-wide">
              Mood: {mood}/10
            </span>
          </div>
        )}
      </div>

      <div className="relative bg-white p-5 rounded-2xl rounded-tl-none shadow-sm text-gray-800 text-sm md:text-base border border-gray-200 flex-1 speech-bubble transform transition-transform duration-300 hover:scale-[1.01]">
         <p className="whitespace-pre-line leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

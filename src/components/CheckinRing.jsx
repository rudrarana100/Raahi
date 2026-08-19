import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CheckinRing({ totalSeconds = 300, onCheckin, onExpire }) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  useEffect(() => {
    setSecondsRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onExpire]);

  const progressRatio = Math.max(0, secondsRemaining / totalSeconds);
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* SVG Background and Animated Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={secondsRemaining < 60 ? '#dc2626' : '#312e81'}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <Clock className={`w-5 h-5 mb-1 ${secondsRemaining < 60 ? 'text-alert' : 'text-primary'}`} />
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {timeFormatted}
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
            Until Check-in
          </span>
        </div>
      </div>

      {/* Reassuring Action Button */}
      <button
        onClick={onCheckin}
        className="mt-3 px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-light transition-all shadow-sm flex items-center space-x-2"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>I am safe</span>
      </button>
    </div>
  );
}

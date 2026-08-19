import React from 'react';
import { Shield, Phone, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ currentRoute, onNavigate }) {
  const { user, activeTrip, contacts } = useApp();

  return (
    <header className="bg-white text-forest border-b border-forest/10 sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-[6px] bg-vivid text-forest flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-botanical transition-colors">
            <Shield className="w-4 h-4 text-forest stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-forest leading-none block">
              Raahi
            </span>
            <span className="text-[11px] font-mono text-moss uppercase tracking-mono mt-0.5 block">
              AI Safety Companion
            </span>
          </div>
        </div>

        {/* Status Indicator & Navigation */}
        <div className="flex items-center space-x-2.5">
          {activeTrip && (
            <button
              onClick={() => onNavigate('active')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono tracking-mono flex items-center space-x-2 transition-all ${
                activeTrip.status === 'alerted'
                  ? 'bg-alert text-white animate-pulse font-bold'
                  : 'bg-parchment text-forest border border-forest/10 font-medium'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                activeTrip.status === 'alerted' ? 'bg-white' : 'bg-vivid'
              }`}></span>
              <span>{activeTrip.status === 'alerted' ? 'Alert Active' : 'Trip Monitored'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('contacts')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-mono tracking-mono flex items-center space-x-1.5 transition-colors ${
              currentRoute === 'contacts' 
                ? 'bg-forest text-white' 
                : 'bg-card text-forest hover:bg-parchment border border-forest/10'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-moss" />
            <span>Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-mono tracking-mono flex items-center space-x-1.5 transition-colors ${
              currentRoute === 'admin' 
                ? 'bg-forest text-white' 
                : 'bg-card text-forest hover:bg-parchment border border-forest/10'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-moss" />
            <span>Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
}

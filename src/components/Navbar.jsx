import React from 'react';
import { Shield, Phone, MapPin, User, ShieldAlert, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ currentRoute, onNavigate }) {
  const { user, activeTrip, contacts } = useApp();

  return (
    <header className="bg-primary text-white border-b border-indigo-950 shadow-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-900 border border-indigo-700 flex items-center justify-center transition-colors group-hover:bg-indigo-800">
            <Shield className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <h1 className="text-2xl font-serif tracking-tight text-white leading-none">Raahi</h1>
            <p className="text-[10px] text-indigo-300 tracking-wider uppercase font-medium mt-0.5">AI Safety Companion</p>
          </div>
        </div>

        {/* Status Indicator & Navigation */}
        <div className="flex items-center space-x-3">
          {activeTrip && (
            <button
              onClick={() => onNavigate('active')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-2 transition-all ${
                activeTrip.status === 'alerted'
                  ? 'bg-alert text-white animate-pulse'
                  : 'bg-emerald-950 text-emerald-200 border border-emerald-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                activeTrip.status === 'alerted' ? 'bg-white' : 'bg-emerald-400'
              }`}></span>
              <span>{activeTrip.status === 'alerted' ? 'Alert Active' : 'Trip Active'}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('contacts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              currentRoute === 'contacts' 
                ? 'bg-indigo-800 text-white' 
                : 'bg-indigo-950 text-indigo-200 hover:bg-indigo-900 border border-indigo-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              currentRoute === 'admin' 
                ? 'bg-indigo-800 text-white' 
                : 'bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800/80'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
}

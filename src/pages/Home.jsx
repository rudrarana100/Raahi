import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Phone, ShieldCheck, Clock, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, activeTrip, contacts, tripsHistory } = useApp();

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 space-y-12">
      
      {/* Announcement Pill & Hero Stack */}
      <div className="bg-parchment rounded-[9px] border border-forest/10 p-8 sm:p-12 text-center space-y-6 shadow-sm">
        
        {/* Announcement Pill */}
        <div className="inline-flex items-center space-x-2 bg-white border border-forest/10 px-3.5 py-1 rounded-[6px] text-xs font-mono tracking-mono text-forest">
          <span className="w-2 h-2 rounded-full bg-vivid animate-pulse"></span>
          <span>RAAHI BOTANICAL SAFETY ENGINE ACTIVE</span>
        </div>

        {/* Display Headline */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-forest tracking-tight leading-[1.04]">
            Solo Commute & Check-in Safety
          </h1>
          <p className="text-base text-moss max-w-lg mx-auto leading-relaxed font-sans font-normal">
            Welcome back, {user?.name || 'Commuter'}. Proactive Gemini AI safety reasoning, real GPS road routing, and live voice distress monitoring.
          </p>
        </div>

        {/* Dual Primary & Secondary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {!activeTrip ? (
            <button
              onClick={() => navigate('/start-trip')}
              className="px-6 py-3 bg-vivid hover:bg-botanical text-forest rounded-[6px] font-medium text-sm transition-colors shadow-sm flex items-center space-x-2"
            >
              <Navigation className="w-4 h-4 text-forest stroke-[2.5]" />
              <span>Start Monitored Trip</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/active-trip')}
              className="px-6 py-3 bg-vivid hover:bg-botanical text-forest rounded-[6px] font-bold text-sm transition-colors shadow-sm flex items-center space-x-2 animate-pulse"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-forest"></span>
              <span>View Active Trip</span>
            </button>
          )}

          <button
            onClick={() => navigate('/contacts')}
            className="px-5 py-3 bg-white border border-botanical text-forest hover:bg-card rounded-[6px] text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <Phone className="w-4 h-4 text-moss" />
            <span>Manage Contacts</span>
          </button>
        </div>
      </div>

      {/* Emergency Contacts Priority Roster Card */}
      <div className="bg-card rounded-[9px] border border-forest/10 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-forest/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-parchment border border-forest/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-forest" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-forest leading-none">Emergency Contacts Roster</h3>
              <p className="text-xs font-mono text-moss tracking-mono mt-0.5">Notified in priority sequence when risk is detected</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/contacts')}
            className="text-xs font-mono tracking-mono text-botanical hover:text-forest flex items-center space-x-1 font-medium"
          >
            <span>Edit Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((contact, idx) => (
            <div key={contact.contactId || idx} className="p-3.5 bg-white border border-forest/10 rounded-[6px] flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-forest text-parchment font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {contact.priority || (idx + 1)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-forest truncate">{contact.name}</p>
                <p className="text-[11px] font-mono text-moss truncate">{contact.phone}</p>
                <span className="inline-block mt-1 text-[10px] font-mono tracking-mono text-forest bg-parchment px-1.5 py-0.5 rounded-[6px]">
                  {contact.relationship}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips Log */}
      <div className="bg-white rounded-[9px] border border-forest/10 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-forest/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-parchment border border-forest/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-forest" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-forest leading-none">Recent Commutes Log</h3>
              <p className="text-xs font-mono text-moss tracking-mono mt-0.5">Your safety log and monitored trip history</p>
            </div>
          </div>
        </div>

        {tripsHistory.length === 0 ? (
          <div className="text-center py-8 text-moss font-mono text-xs">
            No recent trips logged yet. Start a trip to enable proactive safety monitoring.
          </div>
        ) : (
          <div className="space-y-3">
            {tripsHistory.map((trip, idx) => (
              <div key={trip.tripId || idx} className="p-4 bg-card border border-forest/10 rounded-[6px] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-mono text-forest bg-parchment border border-forest/10 px-2 py-0.5 rounded-[6px]">
                      {trip.mode}
                    </span>
                    <span className="text-xs font-semibold text-forest">
                      {trip.startLocation?.name || 'Start'} → {trip.destination?.name || 'Destination'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-moss">
                    <span>Duration: {trip.expectedDurationMinutes} min</span>
                    <span>Started: {new Date(trip.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[11px] font-mono font-semibold ${
                    trip.status === 'completed' 
                      ? 'bg-parchment text-forest border border-forest/10' 
                      : 'bg-wine text-coral border border-coral'
                  }`}>
                    {trip.status === 'completed' ? 'Completed Safe' : 'Alert Triggered'}
                  </span>
                  {trip.riskScore !== undefined && (
                    <p className="text-[10px] font-mono text-moss mt-1">
                      Risk Index: <strong className="text-forest">{trip.riskScore}/100</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

import React from 'react';
import { Navigation, Phone, ShieldCheck, Clock, MapPin, AlertTriangle, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Home({ onNavigate }) {
  const { user, activeTrip, contacts, tripsHistory } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-primary text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-900/80 border border-indigo-700/60 px-3 py-1 rounded-full text-xs text-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Raahi Companion Active</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight leading-tight">
            Hello, {user?.name || 'Commuter'}
          </h2>
          <p className="text-sm text-indigo-200 leading-relaxed font-sans">
            Ready for your commute. Raahi actively monitors your route, timed check-ins, and voice distress.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            {!activeTrip ? (
              <button
                onClick={() => onNavigate('start-trip')}
                className="px-6 py-3 bg-white text-primary rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors shadow-sm flex items-center space-x-2"
              >
                <Navigation className="w-4 h-4 text-primary" />
                <span>Start a Trip</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('active')}
                className="px-6 py-3 bg-emerald-500 text-slate-950 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors shadow-sm flex items-center space-x-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping"></span>
                <span>View Active Trip</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('contacts')}
              className="px-4 py-3 bg-indigo-900/80 border border-indigo-700/80 text-indigo-100 hover:bg-indigo-900 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Phone className="w-4 h-4 text-indigo-300" />
              <span>Manage Contacts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-slate-900 leading-none">Emergency Contacts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Notified in priority sequence when risk is detected</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contacts')}
            className="text-xs font-medium text-primary hover:text-primary-light flex items-center space-x-1"
          >
            <span>Edit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((contact, idx) => (
            <div key={contact.contactId || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                {contact.priority || (idx + 1)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{contact.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{contact.phone}</p>
                <span className="inline-block mt-0.5 text-[10px] text-indigo-900 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                  {contact.relationship}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trips History */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-slate-900 leading-none">Recent Commutes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your safety log and past monitored trips</p>
            </div>
          </div>
        </div>

        {tripsHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No recent trips logged yet. Start a trip to enable proactive safety monitoring.
          </div>
        ) : (
          <div className="space-y-3">
            {tripsHistory.map((trip, idx) => (
              <div key={trip.tripId || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {trip.mode}
                    </span>
                    <span className="text-xs font-medium text-slate-900">
                      {trip.startLocation?.name || 'Start'} → {trip.destination?.name || 'Destination'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span>Duration: {trip.expectedDurationMinutes} min</span>
                    <span>Started: {new Date(trip.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                    trip.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-900' 
                      : 'bg-red-100 text-red-900'
                  }`}>
                    {trip.status === 'completed' ? 'Completed Safe' : 'Alert Triggered'}
                  </span>
                  {trip.riskScore !== undefined && (
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Risk Score: <strong className="text-slate-800">{trip.riskScore}/100</strong>
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

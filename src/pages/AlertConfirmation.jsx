import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, MapPin, PhoneCall, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AlertConfirmation({ onReturnHome }) {
  const { activeAlert, resolveAlert, contacts, user, activeTrip } = useApp();

  const currentAlert = activeAlert || {
    alertId: 'demo_alert',
    type: 'sos',
    triggeredAt: new Date().toISOString(),
    messageBody: `[RAAHI SAFETY ALERT] EMERGENCY SOS BUTTON ACTIVATED. User: ${user?.name || 'Commuter'} (${user?.phone || 'N/A'}). Time: ${new Date().toLocaleTimeString()}.`,
    trackingUrl: 'http://localhost:5173/alert-sent?tripId=demo',
    contactsNotified: contacts.map((c, i) => ({
      contactId: c.contactId,
      name: c.name,
      phone: c.phone,
      relationship: c.relationship,
      priority: c.priority || (i + 1),
      sent: true,
      sid: `SIM_TWILIO_SID_${1000 + i}`
    }))
  };

  const alertTypeTitles = {
    sos: 'Immediate Emergency SOS Broadcasted',
    no_response: 'Missed Check-In Alert Broadcasted',
    deviation: 'Route Deviation Alert Broadcasted',
    voice_distress: 'Voice Distress Signal Broadcasted'
  };

  const title = alertTypeTitles[currentAlert.type] || 'Emergency Contacts Notified';

  const handleResolve = () => {
    resolveAlert();
    if (onReturnHome) onReturnHome();
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      
      {/* Alert Header Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-alert text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-red-700 space-y-3"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-red-900 border border-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-red-200 bg-red-900/80 px-2 py-0.5 rounded">
              Active Security Incident
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight leading-tight mt-1">{title}</h2>
          </div>
        </div>

        <p className="text-xs text-red-100 leading-relaxed font-sans pt-1">
          Raahi has dispatched your current live GPS coordinates and commute details to your trusted contacts via SMS.
        </p>

        <div className="flex items-center justify-between text-xs text-red-200 border-t border-red-700/60 pt-3">
          <span>Triggered: {new Date(currentAlert.triggeredAt).toLocaleTimeString()}</span>
          <span>Status: Outbound SMS Dispatched</span>
        </div>
      </motion.div>

      {/* Dispatch Log & Notified Contacts List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <PhoneCall className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-lg font-medium text-slate-900 leading-none">
            Notified Contacts (Priority Order)
          </h3>
        </div>

        <div className="space-y-3">
          {(currentAlert.contactsNotified || []).map((c, idx) => (
            <div key={c.contactId || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-full bg-alert text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {c.priority || (idx + 1)}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-900">{c.name}</p>
                    <span className="text-[10px] text-slate-500 font-medium">({c.relationship})</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">{c.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>SMS Dispatched</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outbound SMS Payload Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Transmitted SMS Message Body
        </span>
        <div className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed">
          {currentAlert.messageBody}
        </div>
      </div>

      {/* Resolution Controls */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-serif text-lg font-bold">Are you safe now?</h3>
        </div>
        <p className="text-xs text-emerald-900 leading-relaxed font-sans">
          Resolving this alert will inform your contacts that you are safe and reset the active monitoring state.
        </p>
        <button
          onClick={handleResolve}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
        >
          I am Safe — Resolve Alert
        </button>
      </div>

    </div>
  );
}

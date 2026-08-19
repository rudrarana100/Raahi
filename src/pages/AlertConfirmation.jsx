import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, PhoneCall, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AlertConfirmation({ onReturnHome }) {
  const { activeAlert, resolveAlert, contacts, user } = useApp();

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
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      
      {/* Alert Header Banner */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-wine text-coral rounded-[9px] p-6 sm:p-8 shadow-xl border border-coral space-y-3"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-[6px] bg-wine border border-coral flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7 text-coral animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-mono font-bold tracking-mono text-coral bg-wine/80 px-2 py-0.5 rounded-[6px] border border-coral/40">
              Active Security Incident
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight mt-1">{title}</h2>
          </div>
        </div>

        <p className="text-xs text-white/90 leading-relaxed font-sans pt-1">
          Raahi has dispatched your live GPS coordinates and commute details to your trusted contacts via SMS.
        </p>

        <div className="flex items-center justify-between text-xs font-mono text-coral border-t border-coral/30 pt-3">
          <span>Triggered: {new Date(currentAlert.triggeredAt).toLocaleTimeString()}</span>
          <span>Status: Outbound SMS Dispatched</span>
        </div>
      </motion.div>

      {/* Dispatch Log & Notified Contacts List */}
      <div className="bg-card rounded-[9px] border border-forest/10 p-5 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-forest/10 pb-3">
          <PhoneCall className="w-4 h-4 text-forest" />
          <h3 className="text-lg font-medium text-forest leading-none">
            Notified Contacts (Priority Sequence)
          </h3>
        </div>

        <div className="space-y-3">
          {(currentAlert.contactsNotified || []).map((c, idx) => (
            <div key={c.contactId || idx} className="p-3.5 bg-white border border-forest/10 rounded-[6px] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-full bg-forest text-parchment font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {c.priority || (idx + 1)}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-forest">{c.name}</p>
                    <span className="text-[10px] font-mono text-moss font-medium">({c.relationship})</span>
                  </div>
                  <p className="text-[11px] font-mono text-moss">{c.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-mono text-forest font-semibold bg-parchment px-2.5 py-1 rounded-[6px] border border-forest/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-botanical" />
                <span>SMS Dispatched</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outbound SMS Payload Preview */}
      <div className="bg-white rounded-[9px] border border-forest/10 p-5 shadow-sm space-y-2">
        <span className="block text-[11px] font-mono font-bold text-moss uppercase tracking-mono">
          Transmitted SMS Message Body
        </span>
        <div className="p-3 bg-sage text-parchment font-mono text-xs rounded-[6px] border border-forest/20 leading-relaxed">
          {currentAlert.messageBody}
        </div>
      </div>

      {/* Resolution Controls */}
      <div className="bg-parchment border border-forest/10 rounded-[9px] p-5 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-forest">
          <ShieldCheck className="w-5 h-5 text-botanical stroke-[2.5]" />
          <h3 className="text-lg font-bold">Are you safe now?</h3>
        </div>
        <p className="text-xs text-moss leading-relaxed font-sans">
          Resolving this alert will inform your contacts that you are safe and reset the active monitoring state.
        </p>
        <button
          onClick={handleResolve}
          className="w-full py-3 bg-vivid hover:bg-botanical text-forest rounded-[6px] font-semibold text-xs shadow-sm transition-colors"
        >
          I am Safe — Resolve Alert
        </button>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, AlertCircle, Mic, CheckCircle2, Navigation, AlertTriangle, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MapContainer from '../components/MapContainer';
import CheckinRing from '../components/CheckinRing';
import SosButton from '../components/SosButton';
import VoiceRecorder from '../components/VoiceRecorder';

export default function ActiveTrip({ onTripEnded, onAlertTriggered }) {
  const {
    activeTrip,
    performCheckIn,
    updateCurrentLocation,
    endTrip,
    triggerAlert,
    showCheckinPrompt,
    setShowCheckinPrompt,
    showDeviationNudge,
    setShowDeviationNudge
  } = useApp();

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  if (!activeTrip) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif text-slate-800">No Active Trip</h2>
        <p className="text-xs text-slate-500">You do not have an active commute in progress.</p>
        <button
          onClick={onTripEnded}
          className="px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-medium"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Handle location simulation step forward
  const handleSimulateMove = () => {
    if (!activeTrip || !activeTrip.routePolyline) return;

    const current = activeTrip.currentLocation;
    const dest = activeTrip.destination;

    // Step 20% closer to destination
    const nextLat = current.lat + (dest.lat - current.lat) * 0.25;
    const nextLng = current.lng + (dest.lng - current.lng) * 0.25;

    updateCurrentLocation({
      lat: nextLat,
      lng: nextLng,
      name: 'En route position'
    });
  };

  // Handle location simulation 200m deviation off route
  const handleSimulateDeviation = () => {
    if (!activeTrip) return;
    const current = activeTrip.currentLocation;

    // Off-route deviation by +0.003 (~300 meters away)
    updateCurrentLocation({
      lat: current.lat + 0.0035,
      lng: current.lng + 0.0035,
      name: 'Off-route area'
    });
  };

  // Handle timer expiration -> trigger check-in prompt or escalate
  const handleCheckinExpire = () => {
    setShowCheckinPrompt(true);
  };

  // Handle escalation if user ignores check-in prompt
  const handleEscalateMissed = async () => {
    setShowCheckinPrompt(false);
    const alertDoc = await triggerAlert('no_response');
    if (onAlertTriggered) onAlertTriggered(alertDoc);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 space-y-5">
      
      {/* Active Header & Gemini Risk Badge */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Monitored Trip ({activeTrip.mode})
            </span>
          </div>

          <button
            onClick={endTrip}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium border border-slate-200 transition-colors"
          >
            End Trip Safe
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate font-medium">{activeTrip.startLocation?.name} → {activeTrip.destination?.name}</span>
          </div>
          <span className="font-mono text-slate-500 shrink-0">{activeTrip.expectedDurationMinutes} min duration</span>
        </div>

        {/* Gemini Risk Score Display */}
        {activeTrip.riskScore !== undefined && (
          <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg flex items-start space-x-2.5 text-xs text-indigo-950">
            <Sparkles className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Gemini AI Risk Assessment ({activeTrip.riskScore}/100): </span>
              <span>{activeTrip.riskReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Map */}
      <MapContainer
        startLocation={activeTrip.startLocation}
        destination={activeTrip.destination}
        currentLocation={activeTrip.currentLocation}
        polyline={activeTrip.routePolyline}
        onSimulateMove={handleSimulateMove}
        onSimulateDeviation={handleSimulateDeviation}
      />

      {/* Check-in Countdown & Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        
        <CheckinRing
          totalSeconds={180}
          onCheckin={performCheckIn}
          onExpire={handleCheckinExpire}
        />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium text-xs border border-slate-200 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Mic className="w-4 h-4 text-primary" />
            <span>Voice Check-in</span>
          </button>

          <button
            onClick={performCheckIn}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>I am safe</span>
          </button>
        </div>
      </div>

      {/* SOS Button (Always Accessible, Red) */}
      <div className="bg-red-50 border border-alert/30 rounded-xl p-4 shadow-sm text-center">
        <SosButton compact={true} onSosTriggered={(alertDoc) => onAlertTriggered && onAlertTriggered(alertDoc)} />
      </div>

      {/* Voice Recorder Overlay Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <VoiceRecorder
              onClose={() => setShowVoiceRecorder(false)}
              onComplete={(result) => {
                setShowVoiceRecorder(false);
                if (result.distressFlag && onAlertTriggered) {
                  onAlertTriggered();
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Deviation Soft Nudge Modal */}
      {showDeviationNudge && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-slate-200 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif text-lg font-bold">Route Deviation Detected</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Your location moved 150m+ off the expected route. Are you still good?
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowDeviationNudge(false);
                  performCheckIn();
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Yes, I am fine
              </button>
              <button
                onClick={async () => {
                  setShowDeviationNudge(false);
                  const alertDoc = await triggerAlert('deviation');
                  if (onAlertTriggered) onAlertTriggered(alertDoc);
                }}
                className="flex-1 py-2 bg-alert text-white rounded-lg text-xs font-semibold"
              >
                Alert Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Prompt Modal (If Timer Expired) */}
      {showCheckinPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Check-in Required</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your check-in timer has elapsed. Please confirm your safety within 30 seconds to prevent auto-escalation.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={performCheckIn}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
              >
                Confirm I am Safe
              </button>
              <button
                onClick={handleEscalateMissed}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs"
              >
                Trigger Emergency Alert Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

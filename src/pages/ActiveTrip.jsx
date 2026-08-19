import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, AlertCircle, Mic, CheckCircle2, Navigation, AlertTriangle, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import MapContainer from '../components/MapContainer';
import CheckinRing from '../components/CheckinRing';
import SosButton from '../components/SosButton';
import VoiceRecorder from '../components/VoiceRecorder';

export default function ActiveTrip() {
  const navigate = useNavigate();
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
        <h2 className="text-2xl font-bold text-forest">No Active Trip</h2>
        <p className="text-xs font-mono text-moss">You do not have an active commute in progress.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-vivid text-forest rounded-[6px] text-xs font-medium"
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

    // Step 25% closer to destination
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

    // Off-route deviation
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
    await triggerAlert('no_response');
    navigate('/alert-sent');
  };

  const handleEndTrip = () => {
    endTrip();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      
      {/* Active Header & Gemini Risk Badge */}
      <div className="bg-parchment rounded-[9px] border border-forest/10 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vivid animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-mono text-forest">
              Active Monitored Commute ({activeTrip.mode})
            </span>
          </div>

          <button
            onClick={handleEndTrip}
            className="px-3 py-1 bg-white text-forest hover:bg-card rounded-[6px] text-xs font-mono tracking-mono border border-forest/10 transition-colors"
          >
            End Trip Safe
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-forest border-t border-forest/10 pt-2.5">
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-botanical shrink-0" />
            <span className="truncate font-semibold">{activeTrip.startLocation?.name} → {activeTrip.destination?.name}</span>
          </div>
          <span className="font-mono text-moss shrink-0">{activeTrip.expectedDurationMinutes} min duration</span>
        </div>

        {/* Gemini Risk Score Display */}
        {activeTrip.riskScore !== undefined && (
          <div className="p-2.5 bg-white border border-forest/10 rounded-[6px] flex items-start space-x-2.5 text-xs text-forest">
            <Sparkles className="w-4 h-4 text-botanical shrink-0 mt-0.5" />
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
      <div className="bg-card rounded-[9px] border border-forest/10 p-5 shadow-sm space-y-4">
        
        <CheckinRing
          totalSeconds={180}
          onCheckin={performCheckIn}
          onExpire={handleCheckinExpire}
        />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="py-2.5 px-3 bg-white hover:bg-parchment text-forest rounded-[6px] font-medium text-xs border border-forest/10 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Mic className="w-4 h-4 text-botanical" />
            <span>Live Voice Check-in</span>
          </button>

          <button
            onClick={performCheckIn}
            className="py-2.5 px-3 bg-vivid hover:bg-botanical text-forest rounded-[6px] font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-forest stroke-[2.5]" />
            <span>I am safe</span>
          </button>
        </div>
      </div>

      {/* SOS Button (Always Accessible, Reserved Red) */}
      <div className="bg-wine border border-coral rounded-[9px] p-4 shadow-sm text-center">
        <SosButton compact={true} onSosTriggered={() => navigate('/alert-sent')} />
      </div>

      {/* Voice Recorder Overlay Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 z-50 bg-forest/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <VoiceRecorder
              onClose={() => setShowVoiceRecorder(false)}
              onComplete={(result) => {
                setShowVoiceRecorder(false);
                if (result.distressFlag) {
                  navigate('/alert-sent');
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Deviation Soft Nudge Modal */}
      {showDeviationNudge && (
        <div className="fixed inset-0 z-50 bg-forest/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[9px] p-5 border border-forest/10 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-700">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-forest">Route Deviation Detected</h3>
            </div>
            <p className="text-xs text-moss leading-relaxed font-sans">
              Your location moved 150m+ off the expected route. Are you still good?
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowDeviationNudge(false);
                  performCheckIn();
                }}
                className="flex-1 py-2 bg-vivid text-forest rounded-[6px] text-xs font-semibold"
              >
                Yes, I am fine
              </button>
              <button
                onClick={async () => {
                  setShowDeviationNudge(false);
                  await triggerAlert('deviation');
                  navigate('/alert-sent');
                }}
                className="flex-1 py-2 bg-alert text-white rounded-[6px] text-xs font-semibold"
              >
                Alert Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Prompt Modal (If Timer Expired) */}
      {showCheckinPrompt && (
        <div className="fixed inset-0 z-50 bg-forest/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-[9px] p-6 border border-forest/10 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-forest">Check-in Required</h3>
              <p className="text-xs text-moss mt-1 font-sans">
                Your check-in timer has elapsed. Please confirm your safety within 30 seconds to prevent auto-escalation.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={performCheckIn}
                className="w-full py-3 bg-vivid text-forest rounded-[6px] font-bold text-xs shadow-sm"
              >
                Confirm I am Safe
              </button>
              <button
                onClick={handleEscalateMissed}
                className="w-full py-2.5 bg-card hover:bg-parchment text-forest rounded-[6px] font-medium text-xs border border-forest/10"
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

import React, { useState, useEffect } from 'react';
import { Footprints, Car, Building, MapPin, Clock, Sparkles, ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchRouteRisk } from '../services/api';

export default function StartTrip({ onTripStarted, onBack }) {
  const { startTrip } = useApp();

  const [mode, setMode] = useState('walk');
  
  // Locations
  const [startName, setStartName] = useState('Central Library, Campus');
  const [startLat, setStartLat] = useState(28.6139);
  const [startLng, setStartLng] = useState(77.2090);

  const [destinationName, setDestinationName] = useState('Hostel Block B');
  const [destinationLat, setDestinationLat] = useState(28.6289);
  const [destinationLng, setDestinationLng] = useState(77.2190);

  const [expectedDurationMinutes, setExpectedDurationMinutes] = useState(15);

  // Gemini AI Route Risk Preview
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);
  const [riskData, setRiskData] = useState(null);

  // Quick preset locations for hackathon testing
  const presets = [
    { label: 'Hostel Block B', lat: 28.6289, lng: 77.2190, estMin: 15 },
    { label: 'Metro Station Exit 2', lat: 28.6350, lng: 77.2250, estMin: 25 },
    { label: 'Off-Campus Apartment', lat: 28.6420, lng: 77.2300, estMin: 35 },
    { label: 'Night Shift Office', lat: 28.6050, lng: 77.1950, estMin: 20 },
  ];

  // Evaluate risk when parameters change
  useEffect(() => {
    let active = true;
    const evaluate = async () => {
      setEvaluatingRisk(true);
      try {
        const res = await fetchRouteRisk({
          mode,
          startName,
          destinationName,
          expectedDurationMinutes,
          startedAt: new Date().toISOString()
        });
        if (active) setRiskData(res);
      } catch (err) {
        console.error('Risk preview error:', err);
      } finally {
        if (active) setEvaluatingRisk(false);
      }
    };

    const timer = setTimeout(evaluate, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [mode, startName, destinationName, expectedDurationMinutes]);

  const handleSelectPreset = (preset) => {
    setDestinationName(preset.label);
    setDestinationLat(preset.lat);
    setDestinationLng(preset.lng);
    setExpectedDurationMinutes(preset.estMin);
  };

  const handleConfirmStart = async () => {
    const startLocation = { lat: startLat, lng: startLng, name: startName };
    const destination = { lat: destinationLat, lng: destinationLng, name: destinationName };

    await startTrip({
      mode,
      startLocation,
      destination,
      expectedDurationMinutes
    });

    if (onTripStarted) onTripStarted();
  };

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900">Start a Safe Trip</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select travel mode and destination to enable Gemini AI route scoring.</p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          Cancel
        </button>
      </div>

      {/* 1. Travel Mode Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Select Commute Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode('walk')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              mode === 'walk'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Footprints className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'walk' ? 'text-indigo-200' : 'text-primary'}`} />
            <span className="block text-xs font-bold">Solo Walk</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('cab')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              mode === 'cab'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Car className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'cab' ? 'text-indigo-200' : 'text-primary'}`} />
            <span className="block text-xs font-bold">Cab Ride</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('hostel_checkin')}
            className={`p-3.5 rounded-xl border text-center transition-all ${
              mode === 'hostel_checkin'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Building className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'hostel_checkin' ? 'text-indigo-200' : 'text-primary'}`} />
            <span className="block text-xs font-bold">Hostel Check-in</span>
          </button>
        </div>
      </div>

      {/* 2. Route Inputs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Starting Location</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-indigo-900 absolute left-3 top-3" />
            <input
              type="text"
              value={startName}
              onChange={(e) => setStartName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Destination</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
            <input
              type="text"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1.5">Quick Presets</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Expected Commute Duration</span>
            </span>
            <span className="font-mono text-sm font-bold text-primary">{expectedDurationMinutes} min</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={expectedDurationMinutes}
            onChange={(e) => setExpectedDurationMinutes(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Gemini AI Route Risk Score Badge */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Server-side Gemini AI Risk Scoring
            </span>
          </div>
          {evaluatingRisk && (
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Evaluating...</span>
            </div>
          )}
        </div>

        {riskData ? (
          <div className="flex items-start space-x-3 pt-2">
            <div className={`px-3 py-2 rounded-xl text-center shrink-0 border ${
              riskData.riskScore > 50
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <span className="text-xl font-bold font-mono block leading-none">{riskData.riskScore}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold">Risk Index</span>
            </div>
            <div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                {riskData.reasoning}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Mandatory check-in timer auto-configured to {Math.max(3, Math.floor(expectedDurationMinutes / 3))} minute intervals.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Calculating AI route safety score...</p>
        )}
      </div>

      {/* Confirm & Start Trip Button */}
      <button
        onClick={handleConfirmStart}
        className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <span>Confirm & Start Trip</span>
        <ArrowRight className="w-4 h-4 text-indigo-300" />
      </button>

    </div>
  );
}

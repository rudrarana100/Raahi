import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footprints, Car, Building, MapPin, Clock, Sparkles, ArrowRight, Loader2, Search, CheckCircle2, Navigation, Landmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchRouteRisk } from '../services/api';
import { getUserCurrentLocation, searchLocationsNominatim, fetchOsrmRoute, CAMPUS_PRESETS } from '../services/mapService';

export default function StartTrip() {
  const navigate = useNavigate();
  const { startTrip } = useApp();

  const [mode, setMode] = useState('walk');
  
  // Start Location (editable & preset supported)
  const [startLocation, setStartLocation] = useState(CAMPUS_PRESETS[0]); // Default to Girls Hostel Block A
  const [locatingUser, setLocatingUser] = useState(true);
  const [showStartSelector, setShowStartSelector] = useState(false);

  // Destination Input & Search
  const [destinationSearch, setDestinationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(CAMPUS_PRESETS[2]); // Default to Central Library

  // Route Data
  const [routePolyline, setRoutePolyline] = useState([]);
  const [distanceKm, setDistanceKm] = useState('450 m');
  const [expectedDurationMinutes, setExpectedDurationMinutes] = useState(6);

  // Gemini AI Route Risk Score
  const [evaluatingRisk, setEvaluatingRisk] = useState(false);
  const [riskData, setRiskData] = useState(null);

  // 1. Get browser GPS position on mount (updates start location if granted)
  useEffect(() => {
    let active = true;
    getUserCurrentLocation().then((loc) => {
      if (active) {
        setStartLocation(loc);
        setLocatingUser(false);
      }
    });
    return () => { active = false; };
  }, []);

  // 2. Perform Nominatim & Campus Preset search
  useEffect(() => {
    if (!destinationSearch.trim() || destinationSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocationsNominatim(destinationSearch);
      setSearchResults(results);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [destinationSearch]);

  // 3. Fetch OSRM Route & Gemini Risk when start or destination changes
  useEffect(() => {
    if (!startLocation || !selectedDestination) return;

    let active = true;
    const calculateRoute = async () => {
      setEvaluatingRisk(true);

      const osrmRes = await fetchOsrmRoute(startLocation, selectedDestination);
      if (active) {
        setRoutePolyline(osrmRes.polyline);
        setDistanceKm(osrmRes.distanceKm);
        setExpectedDurationMinutes(osrmRes.durationMinutes);
      }

      const riskRes = await fetchRouteRisk({
        mode,
        startName: startLocation.name,
        destinationName: selectedDestination.name,
        expectedDurationMinutes: osrmRes.durationMinutes,
        startedAt: new Date().toISOString()
      });

      if (active) {
        setRiskData(riskRes);
        setEvaluatingRisk(false);
      }
    };

    calculateRoute();
    return () => { active = false; };
  }, [startLocation, selectedDestination, mode]);

  const handleSelectDestination = (item) => {
    setSelectedDestination(item);
    setDestinationSearch(item.name);
    setSearchResults([]);
  };

  const handleConfirmStart = async () => {
    if (!startLocation || !selectedDestination) {
      alert('Please select a valid destination.');
      return;
    }

    await startTrip({
      mode,
      startLocation,
      destination: selectedDestination,
      expectedDurationMinutes,
      polyline: routePolyline
    });

    navigate('/active-trip');
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest/10 pb-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest tracking-tight">Start Monitored Trip</h2>
          <p className="text-xs font-mono text-moss tracking-mono mt-0.5">Real-time GPS tracking, campus routing, and Gemini AI risk analysis.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono tracking-mono text-moss hover:text-forest px-3 py-1.5 rounded-[6px] border border-forest/10"
        >
          Cancel
        </button>
      </div>

      {/* 1. Travel Mode Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-mono font-bold uppercase tracking-mono text-moss">
          Select Commute Mode
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode('walk')}
            className={`p-3.5 rounded-[6px] border text-center transition-all ${
              mode === 'walk'
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'bg-white text-forest border-forest/10 hover:border-forest/30'
            }`}
          >
            <Footprints className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'walk' ? 'text-vivid' : 'text-forest'}`} />
            <span className="block text-xs font-semibold">Campus Walk</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('cab')}
            className={`p-3.5 rounded-[6px] border text-center transition-all ${
              mode === 'cab'
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'bg-white text-forest border-forest/10 hover:border-forest/30'
            }`}
          >
            <Car className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'cab' ? 'text-vivid' : 'text-forest'}`} />
            <span className="block text-xs font-semibold">Auto / Ride</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('hostel_checkin')}
            className={`p-3.5 rounded-[6px] border text-center transition-all ${
              mode === 'hostel_checkin'
                ? 'bg-forest text-white border-forest shadow-sm'
                : 'bg-white text-forest border-forest/10 hover:border-forest/30'
            }`}
          >
            <Building className={`w-5 h-5 mx-auto mb-1.5 ${mode === 'hostel_checkin' ? 'text-vivid' : 'text-forest'}`} />
            <span className="block text-xs font-semibold">Hostel Check-in</span>
          </button>
        </div>
      </div>

      {/* 2. Campus & Real-World Quick Presets */}
      <div className="bg-parchment rounded-[9px] border border-forest/10 p-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-forest uppercase tracking-mono">
          <Landmark className="w-4 h-4 text-botanical" />
          <span>Quick Campus Landmarks (MMU / University Campus)</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {CAMPUS_PRESETS.slice(0, 6).map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectDestination(preset)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono tracking-mono transition-colors border ${
                selectedDestination?.name === preset.name
                  ? 'bg-forest text-parchment border-forest font-bold'
                  : 'bg-white text-forest border-forest/10 hover:bg-card'
              }`}
            >
              📍 {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Start & Destination Location Controls */}
      <div className="bg-card rounded-[9px] border border-forest/10 p-5 space-y-4 shadow-sm">
        
        {/* Start Location Input with Selector Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-mono font-medium text-moss">
              Starting Location
            </label>
            <button
              type="button"
              onClick={() => setShowStartSelector(!showStartSelector)}
              className="text-[11px] font-mono text-botanical hover:underline"
            >
              {showStartSelector ? 'Close Selection' : 'Change Start Location'}
            </button>
          </div>

          <div className="relative">
            <MapPin className="w-4 h-4 text-forest absolute left-3 top-3" />
            <input
              type="text"
              readOnly
              value={startLocation?.name || 'Locating start position...'}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-[6px] border border-forest/10 text-xs bg-parchment text-forest font-medium font-sans cursor-pointer"
              onClick={() => setShowStartSelector(!showStartSelector)}
            />
          </div>

          {/* Start Location Dropdown Selector */}
          {showStartSelector && (
            <div className="mt-2 p-3 bg-white border border-forest/10 rounded-[6px] space-y-2 z-10">
              <span className="block text-[11px] font-mono font-bold text-moss uppercase tracking-mono">Select Start Location</span>
              
              <button
                type="button"
                onClick={async () => {
                  setLocatingUser(true);
                  const loc = await getUserCurrentLocation();
                  setStartLocation(loc);
                  setLocatingUser(false);
                  setShowStartSelector(false);
                }}
                className="w-full px-3 py-2 bg-parchment text-forest rounded-[6px] text-xs font-mono flex items-center justify-between"
              >
                <span>📡 Use Live Browser GPS</span>
                {locatingUser && <Loader2 className="w-3.5 h-3.5 animate-spin text-botanical" />}
              </button>

              <div className="divide-y divide-forest/5 max-h-36 overflow-y-auto">
                {CAMPUS_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStartLocation(preset);
                      setShowStartSelector(false);
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs hover:bg-parchment font-sans text-forest flex items-center justify-between"
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] font-mono text-moss">Campus Preset</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Destination Search Box */}
        <div className="relative">
          <label className="block text-xs font-mono font-medium text-moss mb-1">
            Search Destination (Campus & Global Geocoding Engine)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-botanical absolute left-3 top-3" />
            <input
              type="text"
              value={destinationSearch}
              onChange={(e) => {
                setDestinationSearch(e.target.value);
                if (selectedDestination && e.target.value !== selectedDestination.name) {
                  setSelectedDestination(null);
                }
              }}
              placeholder="Search hostel block, library, cafeteria, or city..."
              className="w-full pl-9 pr-8 py-2.5 rounded-[6px] border border-forest/10 text-xs focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-sans"
            />
            {searching && <Loader2 className="w-4 h-4 text-moss animate-spin absolute right-3 top-3" />}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && !selectedDestination && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-forest/10 rounded-[9px] shadow-xl z-50 overflow-hidden divide-y divide-forest/5 max-h-56 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDestination(item)}
                  className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-parchment flex items-start space-x-2 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-botanical shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-forest truncate">{item.name}</p>
                    <p className="text-[10px] font-mono text-moss truncate">{item.fullName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Destination Summary & OSRM Calculations */}
        {selectedDestination && (
          <div className="p-3.5 bg-parchment border border-forest/10 rounded-[6px] text-xs space-y-1">
            <div className="flex items-center space-x-2 font-bold text-forest">
              <CheckCircle2 className="w-4 h-4 text-botanical" />
              <span>Route Resolved: {startLocation?.name} → {selectedDestination.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-moss pt-1 font-mono">
              <span>Commute Distance: <strong className="text-forest">{distanceKm}</strong></span>
              <span>Estimated Duration: <strong className="text-forest">{expectedDurationMinutes} min</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Gemini AI Route Risk Score Badge */}
      <div className="bg-white rounded-[9px] border border-forest/10 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-botanical" />
            <span className="text-xs font-mono font-bold text-forest uppercase tracking-mono">
              Server-Side Gemini AI Risk Scoring
            </span>
          </div>
          {evaluatingRisk && (
            <div className="flex items-center space-x-1 text-xs font-mono text-moss">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-botanical" />
              <span>Evaluating...</span>
            </div>
          )}
        </div>

        {riskData ? (
          <div className="flex items-start space-x-3 pt-2">
            <div className={`px-3 py-2 rounded-[6px] text-center shrink-0 border ${
              riskData.riskScore > 50
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-mono'
                : 'bg-parchment border-forest/10 text-forest font-mono'
            }`}>
              <span className="text-xl font-bold font-mono block leading-none">{riskData.riskScore}</span>
              <span className="text-[9px] uppercase tracking-mono font-semibold">Risk Index</span>
            </div>
            <div>
              <p className="text-xs text-forest leading-relaxed font-sans font-medium">
                {riskData.reasoning}
              </p>
              <p className="text-[11px] font-mono text-moss mt-1">
                Check-in intervals auto-set to {Math.max(3, Math.floor(expectedDurationMinutes / 2))} minutes.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-moss italic">Select start and destination to trigger Gemini AI risk analysis.</p>
        )}
      </div>

      {/* Confirm & Start Trip Button */}
      <button
        onClick={handleConfirmStart}
        disabled={!selectedDestination || !startLocation}
        className="w-full py-3.5 bg-vivid hover:bg-botanical disabled:bg-card text-forest font-medium text-sm rounded-[6px] transition-all shadow-sm flex items-center justify-center space-x-2"
      >
        <span>Confirm & Start Trip</span>
        <ArrowRight className="w-4 h-4 text-forest stroke-[2.5]" />
      </button>

    </div>
  );
}

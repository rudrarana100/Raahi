import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, AlertTriangle, Eye, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminDashboard() {
  const { activeTrip, tripsHistory, activeAlert } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Security PIN. Use "1234" for hackathon demo access.');
    }
  };

  // Organizational active trips for hostel/campus monitoring demo
  const orgTrips = [
    ...(activeTrip ? [{
      tripId: activeTrip.tripId,
      initials: 'A. R.',
      mode: activeTrip.mode,
      startName: activeTrip.startLocation?.name,
      destName: activeTrip.destination?.name,
      status: activeTrip.status,
      riskScore: activeTrip.riskScore || 25,
      startedAt: activeTrip.startedAt
    }] : []),
    {
      tripId: 'org_trip_102',
      initials: 'P. V.',
      mode: 'walk',
      startName: 'Chemistry Lab',
      destName: 'Girls Hostel Block A',
      status: 'active',
      riskScore: 68,
      startedAt: new Date(Date.now() - 1200000).toISOString()
    },
    {
      tripId: 'org_trip_103',
      initials: 'R. G.',
      mode: 'cab',
      startName: 'Railway Station',
      destName: 'Campus South Gate',
      status: 'alerted',
      riskScore: 85,
      startedAt: new Date(Date.now() - 2400000).toISOString()
    },
    {
      tripId: 'org_trip_104',
      initials: 'S. M.',
      mode: 'hostel_checkin',
      startName: 'Main Gate',
      destName: 'Hostel Block C',
      status: 'completed',
      riskScore: 18,
      startedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-sage text-parchment rounded-[9px] border border-forest/20 shadow-xl overflow-hidden">
          <div className="bg-forest text-white p-6 text-center">
            <div className="w-12 h-12 rounded-[6px] bg-sage border border-parchment/20 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-vivid" />
            </div>
            <h2 className="text-2xl font-bold">Institutional Security Portal</h2>
            <p className="text-xs font-mono text-parchment/80 mt-1">Gated admin view for campus and hostel wardens</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-parchment/90 mb-1">Enter Admin PIN</label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN (Demo PIN: 1234)"
                className="w-full px-3.5 py-2.5 rounded-[6px] border border-parchment/20 text-sm focus:outline-none focus:ring-1 focus:ring-vivid bg-white text-forest font-mono"
              />
              {errorMsg && <p className="text-xs font-mono text-coral font-medium mt-1">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-vivid hover:bg-botanical text-forest font-semibold text-xs rounded-[6px] transition-colors"
            >
              Authenticate Admin Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest/10 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-[6px] bg-forest text-parchment flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-forest">Campus & Hostel Security Roster</h2>
            <p className="text-xs font-mono text-moss tracking-mono">Live anonymized commute tracking across institutional residents</p>
          </div>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs font-mono tracking-mono text-moss hover:text-forest px-3 py-1.5 rounded-[6px] border border-forest/10"
        >
          Lock Admin
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-[9px] border border-forest/10 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-moss uppercase tracking-mono block">Active Commutes</span>
          <span className="text-3xl font-mono text-forest font-bold mt-1 block">
            {orgTrips.filter(t => t.status === 'active').length}
          </span>
        </div>

        <div className="bg-card p-5 rounded-[9px] border border-forest/10 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-mono block">High Risk / Flagged</span>
          <span className="text-3xl font-mono text-amber-800 font-bold mt-1 block">
            {orgTrips.filter(t => t.riskScore > 50 || t.status === 'alerted').length}
          </span>
        </div>

        <div className="bg-card p-5 rounded-[9px] border border-forest/10 shadow-sm">
          <span className="text-[11px] font-mono font-bold text-alert uppercase tracking-mono block">Active Incident Alerts</span>
          <span className="text-3xl font-mono text-alert font-bold mt-1 block">
            {orgTrips.filter(t => t.status === 'alerted').length}
          </span>
        </div>
      </div>

      {/* Active Trips Table */}
      <div className="bg-white rounded-[9px] border border-forest/10 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-forest/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-forest">Institutional Residents Commute Roster</h3>
          <span className="text-xs font-mono text-moss">Anonymized for Privacy</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-parchment border-b border-forest/10 text-forest font-mono font-bold uppercase tracking-mono">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Risk Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {orgTrips.map((trip) => (
                <tr key={trip.tripId} className={`hover:bg-parchment/60 transition-colors ${
                  trip.status === 'alerted' ? 'bg-wine/10' : ''
                }`}>
                  <td className="py-3.5 px-4 font-bold font-mono text-forest">{trip.initials}</td>
                  <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-moss">{trip.mode}</td>
                  <td className="py-3.5 px-4 text-forest font-medium">{trip.startName} → {trip.destName}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-[6px] font-mono font-bold text-[11px] ${
                      trip.riskScore > 50
                        ? 'bg-amber-50 text-amber-900 border border-amber-300'
                        : 'bg-parchment text-forest border border-forest/10'
                    }`}>
                      {trip.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-[6px] font-mono font-bold text-[10px] uppercase tracking-mono ${
                      trip.status === 'alerted'
                        ? 'bg-alert text-white animate-pulse'
                        : trip.status === 'active'
                        ? 'bg-vivid text-forest'
                        : 'bg-card text-moss'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Viewing live monitor telemetry for resident ${trip.initials}`)}
                      className="px-2.5 py-1 bg-white hover:bg-parchment text-forest rounded-[6px] font-mono font-medium text-[11px] border border-forest/10 inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3 text-moss" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

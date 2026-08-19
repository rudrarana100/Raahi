import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, AlertTriangle, Eye, RefreshCw, Building } from 'lucide-react';
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

  // Mock list of organizational active trips for hostel/campus monitoring demo
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-primary text-white p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-900 border border-indigo-700 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-indigo-200" />
            </div>
            <h2 className="text-2xl font-serif">Institutional Security Portal</h2>
            <p className="text-xs text-indigo-200 mt-1">Gated admin view for campus and hostel wardens</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Enter Admin PIN</label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN (Demo PIN: 1234)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
              />
              {errorMsg && <p className="text-xs text-alert font-medium mt-1">{errorMsg}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-medium text-xs rounded-lg transition-colors"
            >
              Authenticate Admin Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-slate-900">Campus & Hostel Security Monitoring</h2>
            <p className="text-xs text-slate-500">Live anonymized commute tracking across institutional residents</p>
          </div>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          Lock Admin
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Commutes</span>
          <span className="text-3xl font-serif text-slate-900 font-bold mt-1 block">
            {orgTrips.filter(t => t.status === 'active').length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">High Risk / Flagged</span>
          <span className="text-3xl font-serif text-amber-700 font-bold mt-1 block">
            {orgTrips.filter(t => t.riskScore > 50 || t.status === 'alerted').length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block font-sans">Active Security Alerts</span>
          <span className="text-3xl font-serif text-red-700 font-bold mt-1 block">
            {orgTrips.filter(t => t.status === 'alerted').length}
          </span>
        </div>
      </div>

      {/* Active Trips Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-slate-900">Institutional Residents Commute Roster</h3>
          <span className="text-xs text-slate-400">Anonymized for Privacy</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Risk Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgTrips.map((trip) => (
                <tr key={trip.tripId} className={`hover:bg-slate-50/80 transition-colors ${
                  trip.status === 'alerted' ? 'bg-red-50/50' : ''
                }`}>
                  <td className="py-3 px-4 font-bold text-slate-900">{trip.initials}</td>
                  <td className="py-3 px-4 uppercase text-[11px] font-mono text-slate-700">{trip.mode}</td>
                  <td className="py-3 px-4 text-slate-800">{trip.startName} → {trip.destName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      trip.riskScore > 50
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {trip.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide ${
                      trip.status === 'alerted'
                        ? 'bg-red-600 text-white animate-pulse'
                        : trip.status === 'active'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Viewing live monitor telemetry for resident ${trip.initials}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium text-[11px] border border-slate-200 inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
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

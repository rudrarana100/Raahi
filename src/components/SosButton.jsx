import React, { useState } from 'react';
import { AlertOctagon, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SosButton({ onSosTriggered, compact = false }) {
  const { triggerEmergencySOS } = useApp();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const alertDoc = await triggerEmergencySOS();
      if (onSosTriggered) onSosTriggered(alertDoc);
    } catch (err) {
      console.error('SOS execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 px-4 bg-alert hover:bg-alert-dark active:bg-alert-dark text-white rounded-[6px] font-bold text-xs font-mono tracking-mono flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 sos-pulse"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <AlertOctagon className="w-4 h-4 text-white" />
        )}
        <span>TRIGGER EMERGENCY SOS</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-4">
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-36 h-36 rounded-full bg-alert hover:bg-alert-dark active:bg-alert-dark text-white font-bold text-lg shadow-xl border-4 border-white flex flex-col items-center justify-center space-y-1 transition-transform active:scale-95 sos-pulse cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        ) : (
          <>
            <AlertOctagon className="w-8 h-8 text-white stroke-[2.5]" />
            <span className="tracking-wider text-xl font-black font-mono">SOS</span>
            <span className="text-[10px] font-mono tracking-mono uppercase opacity-90">One Tap Alert</span>
          </>
        )}
      </button>
      <p className="text-xs font-mono text-moss mt-2">
        Immediately alerts priority contacts with live coordinates.
      </p>
    </div>
  );
}

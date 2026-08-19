import React, { useState } from 'react';
import { Mic, Square, Loader2, Volume2, Sparkles, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VoiceRecorder({ onComplete, onClose }) {
  const { processVoiceCheckin } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [toneCue, setToneCue] = useState('Normal speaking cadence');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const startSimulatedRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setAnalysisResult(null);

    // Simulate 3-second recording interval
    setTimeout(() => {
      setIsRecording(false);
      setTranscript('I am safe and walking near the hostel gate.');
    }, 2500);
  };

  const handleQuickPreset = (presetText, presetTone) => {
    setTranscript(presetText);
    if (presetTone) setToneCue(presetTone);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    setAnalyzing(true);

    try {
      const result = await processVoiceCheckin(transcript, toneCue);
      setAnalysisResult(result);
      if (onComplete) {
        setTimeout(() => {
          onComplete(result);
        }, 1800);
      }
    } catch (err) {
      console.error('Voice analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-slate-900 leading-none">Voice Check-in</h3>
            <p className="text-xs text-slate-500 mt-0.5">Analyzed by Gemini server-side AI for distress cues</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs font-medium px-2 py-1"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Recording Control */}
      <div className="flex flex-col items-center justify-center py-3 bg-slate-50 rounded-lg border border-slate-200">
        {!isRecording ? (
          <button
            onClick={startSimulatedRecording}
            className="px-5 py-2.5 bg-primary text-white rounded-full font-medium text-xs hover:bg-primary-light transition-all flex items-center space-x-2 shadow-sm"
          >
            <Mic className="w-4 h-4 text-indigo-300" />
            <span>Record Voice Note</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3 text-amber-700 font-medium text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
            <span>Recording voice note... (speak now)</span>
          </div>
        )}

        {/* Demo Quick Presets */}
        <div className="mt-3 w-full px-4">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider text-center mb-1.5">
            Demo Presets (Select to test Gemini distress analysis)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => handleQuickPreset('I am safe and reaching hostel in 5 minutes.', 'Calm, steady voice')}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 text-left truncate"
            >
              "I am safe and reaching hostel in 5 min"
            </button>
            <button
              onClick={() => handleQuickPreset('I am fine, don\'t worry about me...', 'Hesitant, forced cadence, background footsteps')}
              className="px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-200 rounded text-amber-900 text-left truncate"
            >
              "I am fine, don't worry..." (Forced duress)
            </button>
            <button
              onClick={() => handleQuickPreset('Someone is following me near the alley, please help!', 'Panicked, rapid breath')}
              className="px-2.5 py-1.5 bg-white hover:bg-red-50 border border-red-200 rounded text-red-900 text-left sm:col-span-2 truncate font-medium"
            >
              "Someone is following me near the alley, help!" (Explicit threat)
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Input */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Voice Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak or tap a demo preset above..."
          rows={2}
          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 bg-white"
        />
      </div>

      {/* Tone Cue Details */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Tone Cue:</span>
        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">{toneCue}</span>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!transcript.trim() || analyzing}
        className="w-full py-2.5 bg-primary hover:bg-primary-light disabled:bg-slate-300 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center space-x-2"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Analyzing with Gemini AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span>Submit for Server-Side AI Verification</span>
          </>
        )}
      </button>

      {/* Live Analysis Display */}
      {analysisResult && (
        <div className={`p-3 rounded-lg border text-xs space-y-1 ${
          analysisResult.distressFlag
            ? 'bg-red-50 border-alert text-red-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center space-x-2 font-medium">
            {analysisResult.distressFlag ? (
              <AlertTriangle className="w-4 h-4 text-alert" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-600" />
            )}
            <span>
              {analysisResult.distressFlag
                ? 'DISTRESS DETECTED — ESCALATING TO EMERGENCY CONTACTS'
                : 'VERIFIED SAFE — CHECK-IN CONFIRMED'}
            </span>
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed font-sans">
            <strong>Gemini Reasoning:</strong> {analysisResult.distressReasoning}
          </p>
        </div>
      )}
    </div>
  );
}

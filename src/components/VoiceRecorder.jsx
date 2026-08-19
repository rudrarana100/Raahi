import React, { useState, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VoiceRecorder({ onComplete, onClose }) {
  const { processVoiceCheckin } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [toneCue, setToneCue] = useState('Normal speaking cadence');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [micSupported, setMicSupported] = useState(true);

  // Initialize SpeechRecognition API for real microphone speech-to-text
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  const handleStartRealMicrophone = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback if browser speech recognition is missing
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setTranscript('I am safe and walking near the hostel gate.');
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        setAnalysisResult(null);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start microphone:', err);
      setIsRecording(false);
    }
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
    <div className="bg-white rounded-[9px] border border-forest/10 p-6 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest/10 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-parchment border border-forest/10 flex items-center justify-center">
            <Mic className="w-4 h-4 text-forest" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-forest leading-none">Voice Safety Check-in</h3>
            <p className="text-xs font-mono text-moss tracking-mono mt-0.5">Real microphone speech-to-text & Gemini AI distress analysis</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-moss hover:text-forest text-xs font-mono font-medium px-2 py-1"
          >
            Close
          </button>
        )}
      </div>

      {/* Real Microphone Recording Button */}
      <div className="flex flex-col items-center justify-center py-4 bg-card rounded-[6px] border border-forest/10 space-y-3">
        {!isRecording ? (
          <button
            onClick={handleStartRealMicrophone}
            className="px-5 py-2.5 bg-vivid hover:bg-botanical text-forest rounded-[6px] font-bold text-xs transition-all shadow-sm flex items-center space-x-2"
          >
            <Mic className="w-4 h-4 text-forest stroke-[2.5]" />
            <span>{micSupported ? 'Tap & Speak into Microphone' : 'Record Simulated Voice Note'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3 text-alert font-mono font-bold text-xs">
            <span className="w-3 h-3 rounded-full bg-alert animate-ping"></span>
            <span>Listening to microphone... Speak clearly now!</span>
          </div>
        )}

        {/* Demo Distress Cues Presets */}
        <div className="w-full px-4 pt-1">
          <span className="block text-[10px] font-mono text-moss font-bold uppercase tracking-mono text-center mb-1.5">
            Test Gemini AI Distress Classifier Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
            <button
              onClick={() => handleQuickPreset('I am safe and reaching hostel in 5 minutes.', 'Calm, steady voice')}
              className="px-2.5 py-1.5 bg-white hover:bg-parchment border border-forest/10 rounded-[6px] text-forest text-left truncate"
            >
              "I am safe and reaching hostel in 5 min"
            </button>
            <button
              onClick={() => handleQuickPreset('I am fine, don\'t worry about me...', 'Hesitant, forced cadence, background footsteps')}
              className="px-2.5 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 rounded-[6px] text-amber-900 text-left truncate"
            >
              "I am fine, don't worry..." (Coerced)
            </button>
            <button
              onClick={() => handleQuickPreset('Someone is following me near the alley, please help!', 'Panicked, rapid breath')}
              className="px-2.5 py-1.5 bg-wine text-coral border border-coral rounded-[6px] text-left sm:col-span-2 truncate font-bold"
            >
              "Someone is following me near the alley, help!" (Threat)
            </button>
          </div>
        </div>
      </div>

      {/* Captured Speech Transcript Input */}
      <div>
        <label className="block text-xs font-mono font-medium text-forest mb-1">
          Live Captured Speech Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak into microphone or select a preset above..."
          rows={2}
          className="w-full text-xs p-2.5 rounded-[6px] border border-forest/10 focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-sans"
        />
      </div>

      {/* Tone Cue Metadata */}
      <div className="flex items-center justify-between text-xs font-mono text-moss">
        <span>Audio Tone Cue:</span>
        <span className="text-[11px] bg-parchment px-2 py-0.5 rounded-[6px] text-forest border border-forest/10">{toneCue}</span>
      </div>

      {/* Submit Action */}
      <button
        onClick={handleSubmit}
        disabled={!transcript.trim() || analyzing}
        className="w-full py-3 bg-vivid hover:bg-botanical disabled:bg-card text-forest rounded-[6px] font-bold text-xs transition-colors shadow-sm flex items-center justify-center space-x-2"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-forest" />
            <span>Evaluating Audio with Server Gemini AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-forest stroke-[2.5]" />
            <span>Analyze with Server Gemini AI</span>
          </>
        )}
      </button>

      {/* Live Gemini Distress Result Output */}
      {analysisResult && (
        <div className={`p-3.5 rounded-[6px] border text-xs space-y-1 ${
          analysisResult.distressFlag
            ? 'bg-wine text-coral border-coral'
            : 'bg-parchment border-forest/20 text-forest'
        }`}>
          <div className="flex items-center space-x-2 font-bold font-mono">
            {analysisResult.distressFlag ? (
              <AlertTriangle className="w-4 h-4 text-coral animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-botanical" />
            )}
            <span>
              {analysisResult.distressFlag
                ? 'DISTRESS DETECTED — ESCALATING EMERGENCY SMS'
                : 'VERIFIED SAFE — CHECK-IN CONFIRMED'}
            </span>
          </div>
          <p className="text-[11px] opacity-95 leading-relaxed font-sans pt-0.5">
            <strong>Gemini AI Reasoning:</strong> {analysisResult.distressReasoning}
          </p>
        </div>
      )}
    </div>
  );
}

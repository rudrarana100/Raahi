import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let GoogleGenerativeAI = null;
try {
  const genAiModule = require('@google/generative-ai');
  GoogleGenerativeAI = genAiModule.GoogleGenerativeAI;
} catch (err) {
  console.warn('Gemini package require warning:', err.message);
}

// Initialize Gemini client if API key is provided
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let genAI = null;
if (GoogleGenerativeAI && apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI client successfully initialized.');
  } catch (err) {
    console.warn('Gemini client initialization warning:', err.message);
  }
}

/**
 * Server-side route risk scoring using Gemini API
 */
export async function evaluateRouteRisk({ mode, startName, destinationName, expectedDurationMinutes, startedAt }) {
  const currentHour = new Date(startedAt || Date.now()).getHours();
  const isNight = currentHour >= 21 || currentHour <= 5;
  const isLateEvening = currentHour >= 18 && currentHour < 21;

  const prompt = `You are a personal safety risk evaluation system for solo commuters.
Evaluate the commute risk for the following parameters:
- Travel Mode: ${mode} (e.g. walk, cab, hostel_checkin)
- Starting location: ${startName || 'Current location'}
- Destination: ${destinationName || 'Target location'}
- Expected duration: ${expectedDurationMinutes} minutes
- Time of day: ${currentHour}:00 (${isNight ? 'Late night' : isLateEvening ? 'Late evening' : 'Daytime'})

Provide a JSON output with EXACTLY two fields:
1. "riskScore": an integer from 0 to 100 representing risk level (0 = extremely low, 100 = critical risk).
2. "reasoning": a concise, single-sentence explanation of why this risk score was assigned. Do NOT use em dashes.

Return ONLY raw JSON, no markdown formatting or backticks.`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text ? result.response.text() : '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        riskScore: Math.min(100, Math.max(0, parseInt(parsed.riskScore, 10) || 25)),
        reasoning: parsed.reasoning || 'Standard route risk calculated based on mode and time of day.'
      };
    } catch (error) {
      console.error('Gemini API call failed, using heuristic evaluation:', error.message);
    }
  }

  // Smart Heuristic Fallback if Gemini key is missing or call fails
  let score = 15;
  let reasonParts = [];

  if (isNight) {
    score += 40;
    reasonParts.push('Commute occurs during late night hours');
  } else if (isLateEvening) {
    score += 20;
    reasonParts.push('Commute occurs during evening hours');
  } else {
    reasonParts.push('Daytime commute');
  }

  if (mode === 'walk') {
    score += 20;
    reasonParts.push('walking alone');
  } else if (mode === 'cab') {
    score += 15;
    reasonParts.push('solo cab ride');
  } else if (mode === 'hostel_checkin') {
    score += 5;
    reasonParts.push('hostel entry tracking');
  }

  if (expectedDurationMinutes > 45) {
    score += 15;
    reasonParts.push('extended trip duration');
  }

  score = Math.min(95, Math.max(10, score));

  return {
    riskScore: score,
    reasoning: `${reasonParts.join(', ')}. Monitoring check-ins active.`
  };
}

/**
 * Server-side voice distress classification using Gemini API
 */
export async function analyzeVoiceDistress({ transcript, tone }) {
  const prompt = `You are an emergency voice distress analyzer for a personal safety app.
Analyze the following transcript from a solo commuter's voice check-in:

Transcript: "${transcript || ''}"
Tone cues: "${tone || 'Normal speech rate'}"

Determine if the speaker is under duress, being followed, forced to speak under threat, or asking for help.
Note: A user saying "I am safe" under forced duress may sound hesitant or include subtle distress signals.

Provide a JSON output with EXACTLY two fields:
1. "distressFlag": boolean (true if distress or threat is detected, false otherwise).
2. "distressReasoning": a concise, single-sentence explanation of why distress was or was not flagged. Do NOT use em dashes.

Return ONLY raw JSON, no markdown formatting or backticks.`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text ? result.response.text() : '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      return {
        distressFlag: Boolean(parsed.distressFlag),
        distressReasoning: parsed.distressReasoning || 'Voice sample analyzed server-side.'
      };
    } catch (error) {
      console.error('Gemini Voice Distress API call failed, using heuristic:', error.message);
    }
  }

  // Fallback pattern matching
  const lowerText = (transcript || '').toLowerCase();
  const distressKeywords = ['help', 'follow', 'scared', 'stop', 'who are you', 'leave me', 'unsafe', 'behind me', 'no no', 'please don\'t', 'danger', 'shhh'];
  const hasDistressWord = distressKeywords.some(kw => lowerText.includes(kw));

  return {
    distressFlag: hasDistressWord,
    distressReasoning: hasDistressWord
      ? `Keyword distress signal detected in voice check-in: "${transcript}".`
      : `Voice check-in verified clear. No distress indicators detected.`
  };
}

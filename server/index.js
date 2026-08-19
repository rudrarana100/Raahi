import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { evaluateRouteRisk, analyzeVoiceDistress } from './services/geminiService.js';
import { sendEmergencyAlert } from './services/twilioService.js';
import { evaluateDeviation } from './services/deviationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Raahi Cloud Run API', timestamp: new Date().toISOString() });
});

// Route Risk Scoring via Gemini API
app.post('/api/risk-score', async (req, res) => {
  try {
    const { mode, startName, destinationName, expectedDurationMinutes, startedAt } = req.body;
    const result = await evaluateRouteRisk({
      mode: mode || 'walk',
      startName,
      destinationName,
      expectedDurationMinutes: expectedDurationMinutes || 20,
      startedAt
    });
    res.json(result);
  } catch (error) {
    console.error('Route risk endpoint error:', error);
    res.status(500).json({ error: 'Failed to score route risk', details: error.message });
  }
});

// Voice Distress Analysis via Gemini API
app.post('/api/voice-checkin', async (req, res) => {
  try {
    const { transcript, tone } = req.body;
    const result = await analyzeVoiceDistress({ transcript, tone });
    res.json(result);
  } catch (error) {
    console.error('Voice check-in endpoint error:', error);
    res.status(500).json({ error: 'Failed to analyze voice check-in', details: error.message });
  }
});

// Route Deviation Detection
app.post('/api/deviation-check', (req, res) => {
  try {
    const { currentLocation, polyline, consecutiveDeviations } = req.body;
    const result = evaluateDeviation({
      currentLocation,
      polyline,
      consecutiveDeviations: consecutiveDeviations || 0,
      thresholdMeters: 150
    });
    res.json(result);
  } catch (error) {
    console.error('Deviation check error:', error);
    res.status(500).json({ error: 'Failed to evaluate deviation', details: error.message });
  }
});

// Emergency Alert Dispatch (Twilio SMS / Outbound)
app.post('/api/send-alert', async (req, res) => {
  try {
    const { user, contacts, trip, alertType, location } = req.body;
    const result = await sendEmergencyAlert({
      user,
      contacts,
      trip,
      alertType: alertType || 'sos',
      location
    });
    res.json(result);
  } catch (error) {
    console.error('Alert dispatch error:', error);
    res.status(500).json({ error: 'Failed to send emergency alert', details: error.message });
  }
});

// Immediate SOS Endpoint
app.post('/api/sos', async (req, res) => {
  try {
    const { user, contacts, trip, location } = req.body;
    const result = await sendEmergencyAlert({
      user,
      contacts,
      trip,
      alertType: 'sos',
      location
    });
    res.json(result);
  } catch (error) {
    console.error('SOS endpoint error:', error);
    res.status(500).json({ error: 'Failed to trigger SOS', details: error.message });
  }
});

// Missed Check-in Escalation
app.post('/api/missed-checkin', async (req, res) => {
  try {
    const { trip, user, contacts, location } = req.body;
    const result = await sendEmergencyAlert({
      user,
      contacts,
      trip,
      alertType: 'no_response',
      location
    });
    res.json(result);
  } catch (error) {
    console.error('Missed check-in error:', error);
    res.status(500).json({ error: 'Failed to escalate missed check-in', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Raahi Backend Service running on port ${PORT}`);
  console.log(`Cloud Run Service Skeleton Ready`);
  console.log(`====================================================`);
});

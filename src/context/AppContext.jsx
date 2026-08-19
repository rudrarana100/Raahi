import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { localStore, db, firebaseAvailable, generateId } from '../lib/firebase';
import { fetchRouteRisk, triggerSos, sendEmergencyAlert, submitVoiceCheckin, checkRouteDeviation } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. User State
  const [user, setUserState] = useState(() => localStore.getUser());

  // 2. Emergency Contacts
  const [contacts, setContactsState] = useState(() => localStore.getContacts());

  // 3. Active Trip
  const [activeTrip, setActiveTripState] = useState(() => localStore.getActiveTrip());

  // 4. Trips History
  const [tripsHistory, setTripsHistory] = useState(() => localStore.getTripsHistory());

  // 5. Active Alert state (SOS / Missed check-in / Deviation / Voice distress)
  const [activeAlert, setActiveAlert] = useState(null);

  // 6. Check-in prompt modal visibility
  const [showCheckinPrompt, setShowCheckinPrompt] = useState(false);

  // 7. Deviation nudge visibility ("Still good?")
  const [showDeviationNudge, setShowDeviationNudge] = useState(false);

  // Save User
  const saveUser = (userData) => {
    const fullUser = {
      uid: userData.uid || generateId('usr'),
      name: userData.name || '',
      phone: userData.phone || '',
      emergencyPin: userData.emergencyPin || '1234',
      createdAt: userData.createdAt || new Date().toISOString()
    };
    setUserState(fullUser);
    localStore.setUser(fullUser);
  };

  // Save Contacts
  const saveContacts = (contactsList) => {
    const sorted = [...contactsList].map((c, idx) => ({
      ...c,
      contactId: c.contactId || generateId('cnt'),
      priority: c.priority || (idx + 1)
    })).sort((a, b) => a.priority - b.priority);

    setContactsState(sorted);
    localStore.setContacts(sorted);
  };

  const addContact = (contactData) => {
    const newContact = {
      contactId: generateId('cnt'),
      name: contactData.name,
      phone: contactData.phone,
      relationship: contactData.relationship || 'Emergency Contact',
      priority: contacts.length + 1
    };
    const updated = [...contacts, newContact];
    saveContacts(updated);
  };

  const removeContact = (contactId) => {
    const updated = contacts.filter(c => c.contactId !== contactId);
    saveContacts(updated);
  };

  // Start Trip
  const startTrip = async ({ mode, startLocation, destination, expectedDurationMinutes }) => {
    const tripId = generateId('trip');
    const startedAt = new Date().toISOString();

    // Call server-side Gemini API for route risk evaluation
    const riskData = await fetchRouteRisk({
      mode,
      startName: startLocation.name,
      destinationName: destination.name,
      expectedDurationMinutes,
      startedAt
    });

    // Default polyline path connecting start and destination
    const polyline = [
      { lat: startLocation.lat, lng: startLocation.lng },
      { lat: (startLocation.lat * 2 + destination.lat) / 3, lng: (startLocation.lng * 2 + destination.lng) / 3 },
      { lat: (startLocation.lat + destination.lat * 2) / 3, lng: (startLocation.lng + destination.lng * 2) / 3 },
      { lat: destination.lat, lng: destination.lng }
    ];

    const newTrip = {
      tripId,
      userId: user?.uid || 'guest',
      mode: mode || 'walk',
      startLocation,
      destination,
      expectedDurationMinutes: expectedDurationMinutes || 15,
      startedAt,
      status: 'active',
      currentLocation: { ...startLocation, updatedAt: startedAt },
      routePolyline: polyline,
      riskScore: riskData.riskScore,
      riskReason: riskData.reasoning,
      lastCheckInAt: startedAt,
      consecutiveDeviations: 0
    };

    setActiveTripState(newTrip);
    localStore.setActiveTrip(newTrip);
    setShowCheckinPrompt(false);
    setShowDeviationNudge(false);

    return newTrip;
  };

  // Update Location & Check Deviation
  const updateCurrentLocation = async (newLocation) => {
    if (!activeTrip || activeTrip.status !== 'active') return;

    const updatedAt = new Date().toISOString();
    const updatedLoc = { ...newLocation, updatedAt };

    // Check route deviation via Express API
    const deviationRes = await checkRouteDeviation({
      currentLocation: updatedLoc,
      polyline: activeTrip.routePolyline,
      consecutiveDeviations: activeTrip.consecutiveDeviations || 0
    });

    const updatedTrip = {
      ...activeTrip,
      currentLocation: updatedLoc,
      consecutiveDeviations: deviationRes.consecutiveCount
    };

    if (deviationRes.action === 'TRIGGER_NUDGE') {
      setShowDeviationNudge(true);
    } else if (deviationRes.action === 'ESCALATE_ALERT') {
      triggerAlert('deviation', updatedLoc);
    }

    setActiveTripState(updatedTrip);
    localStore.setActiveTrip(updatedTrip);
  };

  // Perform Manual Safe Check-In ("I'm Safe")
  const performCheckIn = () => {
    if (!activeTrip) return;
    const now = new Date().toISOString();
    const updatedTrip = {
      ...activeTrip,
      lastCheckInAt: now,
      consecutiveDeviations: 0
    };
    setActiveTripState(updatedTrip);
    localStore.setActiveTrip(updatedTrip);
    setShowCheckinPrompt(false);
    setShowDeviationNudge(false);
  };

  // Trigger Emergency SOS (Immediate broadcast)
  const triggerEmergencySOS = async () => {
    const location = activeTrip?.currentLocation || { lat: 28.6139, lng: 77.2090 };
    const res = await triggerSos({
      user,
      contacts,
      trip: activeTrip,
      location
    });

    const alertDoc = {
      alertId: generateId('alt'),
      tripId: activeTrip?.tripId || 'manual',
      userId: user?.uid || 'user',
      type: 'sos',
      triggeredAt: new Date().toISOString(),
      contactsNotified: res.contactsNotified,
      messageBody: res.messageBody,
      trackingUrl: res.trackingUrl,
      resolvedAt: null
    };

    setActiveAlert(alertDoc);
    localStore.addAlert(alertDoc);

    if (activeTrip) {
      const updatedTrip = { ...activeTrip, status: 'alerted' };
      setActiveTripState(updatedTrip);
      localStore.setActiveTrip(updatedTrip);
    }

    return alertDoc;
  };

  // Trigger Specific Alert Type (No Response / Deviation / Voice Distress)
  const triggerAlert = async (alertType, customLocation, extraDetails = {}) => {
    const location = customLocation || activeTrip?.currentLocation || { lat: 28.6139, lng: 77.2090 };
    const res = await sendEmergencyAlert({
      user,
      contacts,
      trip: activeTrip,
      alertType,
      location
    });

    const alertDoc = {
      alertId: generateId('alt'),
      tripId: activeTrip?.tripId || 'demo',
      userId: user?.uid || 'user',
      type: alertType,
      triggeredAt: new Date().toISOString(),
      contactsNotified: res.contactsNotified,
      messageBody: res.messageBody,
      trackingUrl: res.trackingUrl,
      resolvedAt: null,
      ...extraDetails
    };

    setActiveAlert(alertDoc);
    localStore.addAlert(alertDoc);

    if (activeTrip) {
      const updatedTrip = { ...activeTrip, status: 'alerted' };
      setActiveTripState(updatedTrip);
      localStore.setActiveTrip(updatedTrip);
    }

    return alertDoc;
  };

  // Submit Voice Checkin to Gemini server
  const processVoiceCheckin = async (transcript, tone) => {
    const analysis = await submitVoiceCheckin({ transcript, tone });
    if (analysis.distressFlag) {
      await triggerAlert('voice_distress', activeTrip?.currentLocation, {
        distressReasoning: analysis.distressReasoning,
        transcript
      });
    } else {
      performCheckIn();
    }
    return analysis;
  };

  // End / Complete Trip
  const endTrip = () => {
    if (!activeTrip) return;
    const completedTrip = {
      ...activeTrip,
      status: 'completed',
      completedAt: new Date().toISOString()
    };
    localStore.addTripToHistory(completedTrip);
    setTripsHistory(localStore.getTripsHistory());
    setActiveTripState(null);
    localStore.setActiveTrip(null);
    setShowCheckinPrompt(false);
    setShowDeviationNudge(false);
  };

  // Resolve Active Alert
  const resolveAlert = () => {
    if (activeAlert) {
      const resolved = { ...activeAlert, resolvedAt: new Date().toISOString() };
      setActiveAlert(null);
    }
    if (activeTrip && activeTrip.status === 'alerted') {
      const updated = { ...activeTrip, status: 'active' };
      setActiveTripState(updated);
      localStore.setActiveTrip(updated);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      saveUser,
      contacts,
      saveContacts,
      addContact,
      removeContact,
      activeTrip,
      startTrip,
      updateCurrentLocation,
      performCheckIn,
      triggerEmergencySOS,
      triggerAlert,
      processVoiceCheckin,
      endTrip,
      tripsHistory,
      activeAlert,
      resolveAlert,
      showCheckinPrompt,
      setShowCheckinPrompt,
      showDeviationNudge,
      setShowDeviationNudge
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

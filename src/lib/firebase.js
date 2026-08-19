import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, where, orderBy, updateDoc, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration from environment or fallback template
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyRaahiDemoKeyConfiguredForHackathon123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "raahi-safety.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "raahi-safety",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "raahi-safety.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcd1234efgh5678"
};

let app, db, auth;
let firebaseAvailable = false;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  firebaseAvailable = true;
} catch (err) {
  console.warn('Firebase initialization note: using hybrid resilient state layer.', err.message);
}

export { app, db, auth, firebaseAvailable };

/**
 * Helper to generate unique IDs
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Storage key constants for hybrid state manager
 */
const STORAGE_KEYS = {
  USER: 'raahi_user_profile',
  CONTACTS: 'raahi_emergency_contacts',
  ACTIVE_TRIP: 'raahi_active_trip',
  TRIPS_HISTORY: 'raahi_trips_history',
  ALERTS: 'raahi_alerts_history',
};

/**
 * Local state persistence helpers
 */
export const localStore = {
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  getContacts: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (data) return JSON.parse(data);
    } catch {}
    // Default demo contacts if empty
    return [
      { contactId: 'c1', name: 'Aarav Sharma', phone: '+91 98765 43210', relationship: 'Parent / Guardian', priority: 1 },
      { contactId: 'c2', name: 'Priya Verma', phone: '+91 98765 12345', relationship: 'Hostel Warden', priority: 2 },
      { contactId: 'c3', name: 'Rohan Gupta', phone: '+91 98123 45678', relationship: 'Trusted Friend', priority: 3 }
    ];
  },
  setContacts: (contacts) => {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  },
  getActiveTrip: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setActiveTrip: (trip) => {
    if (!trip) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TRIP);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP, JSON.stringify(trip));
    }
  },
  getTripsHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIPS_HISTORY);
      if (data) return JSON.parse(data);
    } catch {}
    return [
      {
        tripId: 'trip_demo_1',
        userId: 'user_1',
        mode: 'walk',
        startLocation: { lat: 28.6139, lng: 77.2090, name: 'Library' },
        destination: { lat: 28.6289, lng: 77.2190, name: 'Block B Hostel' },
        expectedDurationMinutes: 15,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        riskScore: 22,
        riskReason: 'Daytime walk on campus perimeter.'
      }
    ];
  },
  addTripToHistory: (trip) => {
    const history = localStore.getTripsHistory();
    const updated = [trip, ...history.filter(t => t.tripId !== trip.tripId)];
    localStorage.setItem(STORAGE_KEYS.TRIPS_HISTORY, JSON.stringify(updated));
  },
  getAlertsHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },
  addAlert: (alert) => {
    const alerts = localStore.getAlertsHistory();
    const updated = [alert, ...alerts];
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
  }
};

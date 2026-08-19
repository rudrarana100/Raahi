import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import StartTrip from './pages/StartTrip';
import ActiveTrip from './pages/ActiveTrip';
import AlertConfirmation from './pages/AlertConfirmation';
import ContactsManager from './pages/ContactsManager';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const { user, activeTrip, activeAlert } = useApp();
  const [currentRoute, setCurrentRoute] = useState('home');

  // Route routing logic
  useEffect(() => {
    // If URL contains alert-sent or alert is active, show alert screen
    if (window.location.pathname.includes('/alert-sent') || activeAlert) {
      setCurrentRoute('alert-sent');
      return;
    }

    // If URL is /admin, show admin view
    if (window.location.pathname.includes('/admin')) {
      setCurrentRoute('admin');
      return;
    }

    // If no user profile exists, force onboarding
    if (!user || !user.name) {
      setCurrentRoute('onboarding');
      return;
    }

    // If trip is currently active, open active trip screen
    if (activeTrip && (activeTrip.status === 'active' || activeTrip.status === 'alerted')) {
      setCurrentRoute('active');
    }
  }, [user, activeTrip, activeAlert]);

  const handleNavigate = (route) => {
    setCurrentRoute(route);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-900 selection:text-white">
      {currentRoute !== 'onboarding' && (
        <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />
      )}

      <main className="flex-1">
        {currentRoute === 'onboarding' && (
          <Onboarding onComplete={() => setCurrentRoute('home')} />
        )}

        {currentRoute === 'home' && (
          <Home onNavigate={handleNavigate} />
        )}

        {currentRoute === 'start-trip' && (
          <StartTrip
            onTripStarted={() => setCurrentRoute('active')}
            onBack={() => setCurrentRoute('home')}
          />
        )}

        {currentRoute === 'active' && (
          <ActiveTrip
            onTripEnded={() => setCurrentRoute('home')}
            onAlertTriggered={() => setCurrentRoute('alert-sent')}
          />
        )}

        {currentRoute === 'alert-sent' && (
          <AlertConfirmation onReturnHome={() => setCurrentRoute('home')} />
        )}

        {currentRoute === 'contacts' && (
          <ContactsManager onBack={() => setCurrentRoute('home')} />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Reassuring Footer */}
      <footer className="py-4 text-center border-t border-slate-200 text-xs text-slate-500 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">Raahi AI Safety Companion. Built for live hackathon execution.</p>
          <div className="flex items-center space-x-3 text-[11px]">
            <button onClick={() => setCurrentRoute('admin')} className="hover:underline text-slate-600">
              Institutional Admin
            </button>
            <span>•</span>
            <button onClick={() => setCurrentRoute('contacts')} className="hover:underline text-slate-600">
              Emergency Contacts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

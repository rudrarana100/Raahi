import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import StartTrip from './pages/StartTrip';
import ActiveTrip from './pages/ActiveTrip';
import AlertConfirmation from './pages/AlertConfirmation';
import ContactsManager from './pages/ContactsManager';
import AdminDashboard from './pages/AdminDashboard';

function NavigationGuard() {
  const { user, activeTrip, activeAlert } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Force onboarding if profile is unconfigured
    if ((!user || !user.name) && location.pathname !== '/onboarding') {
      navigate('/onboarding');
      return;
    }

    // 2. Redirect to alert-sent if active alert exists
    if (activeAlert && location.pathname !== '/alert-sent') {
      navigate('/alert-sent');
      return;
    }
  }, [user, activeTrip, activeAlert, location.pathname, navigate]);

  return null;
}

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isHideNavbar = location.pathname === '/onboarding';

  return (
    <div className="min-h-screen flex flex-col bg-white text-forest selection:bg-vivid selection:text-forest">
      <NavigationGuard />

      {!isHideNavbar && (
        <Navbar
          currentRoute={location.pathname.replace('/', '') || 'home'}
          onNavigate={(route) => {
            if (route === 'home') navigate('/');
            else navigate(`/${route}`);
          }}
        />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/start-trip" element={<StartTrip />} />
          <Route path="/active-trip" element={<ActiveTrip />} />
          <Route path="/alert-sent" element={<AlertConfirmation />} />
          <Route path="/contacts" element={<ContactsManager />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      {/* Reassuring Footer */}
      <footer className="py-4 text-center border-t border-forest/10 text-xs font-mono text-moss bg-white">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium font-sans">Raahi AI Safety Companion.</p>
          <div className="flex items-center space-x-3 text-[11px]">
            <button onClick={() => navigate('/admin')} className="hover:underline text-forest font-mono">
              Institutional Admin
            </button>
            <span>•</span>
            <button onClick={() => navigate('/contacts')} className="hover:underline text-forest font-mono">
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
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TripListHome from './components/TripListHome';
import TripDetail from './components/TripDetail';
import { CreateTripModal, SettingsModal } from './components/Modals';
import ToastContainer, { ToastMessage } from './components/Toast';
import Onboarding from './components/Onboarding';
import { Trip, DayItinerary } from './types';
import { INITIAL_TRIPS } from './data';

export default function App() {
  // --- 1. Core State ---
  const [allTrips, setAllTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('vibe_trips_data');
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch (e) {
      return INITIAL_TRIPS;
    }
  });

  const [userAvatar, setUserAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem('vibe_user_avatar') || "https://picsum.photos/id/64/100/100";
    } catch {
      return "https://picsum.photos/id/64/100/100";
    }
  });

  const [theme, setTheme] = useState<'light'|'dark'|'system'>(() => {
      return (localStorage.getItem('travel_theme') as any) || 'light';
  });

  // --- 2. UI State ---
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(() => {
      return !localStorage.getItem('vibe_onboarding_done');
  });

  // --- 3. Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('vibe_trips_data', JSON.stringify(allTrips));
  }, [allTrips]);

  useEffect(() => {
    localStorage.setItem('vibe_user_avatar', userAvatar);
  }, [userAvatar]);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: string) => {
        if (t === 'dark') {
            root.classList.add('dark');
            document.body.classList.add('dark');
            document.body.style.backgroundColor = '#1c1917';
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
            document.body.style.backgroundColor = '#fdfdfd';
        }
    };

    if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(systemTheme);
    } else {
        applyTheme(theme);
    }
    localStorage.setItem('travel_theme', theme);
  }, [theme]);

  // --- 4. Helper Functions ---
  const addToast = (type: 'success' | 'error', text: string) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleOnboardingComplete = () => {
      setShowOnboarding(false);
      localStorage.setItem('vibe_onboarding_done', 'true');
      addToast('success', 'Ready to plan! Create your first trip.');
  };

  // 新增：手动重启教程
  const handleRestartOnboarding = () => {
      setShowOnboarding(true);
  };

  // --- 5. Data Handlers ---
  const handleImportData = (data: any) => {
      try {
          if (data.trips) setAllTrips(data.trips);
          if (data.userAvatar) setUserAvatar(data.userAvatar);
          setIsSettingsOpen(false);
          addToast('success', 'Data restored successfully!');
      } catch (e) {
          addToast('error', 'Failed to restore data.');
      }
  };

  const handleResetToDemo = () => {
      setAllTrips(INITIAL_TRIPS);
      setUserAvatar("https://picsum.photos/id/64/100/100");
      setIsSettingsOpen(false);
      addToast('success', 'Reset to demo data.');
  };

  const handleClearAllData = () => {
      setAllTrips([]);
      localStorage.removeItem('vibe_trips_data');
      setIsSettingsOpen(false);
      addToast('success', 'All data wiped.');
  };

  const handleCreateTrip = (data: { title: string; startDate: string; endDate: string }) => {
    const newId = `trip_${Date.now()}`;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newItinerary: DayItinerary[] = [];
    for (let i = 0; i < diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        newItinerary.push({
            date: d.toISOString().split('T')[0],
            dayLabel: `Day ${i + 1}`,
            activities: []
        });
    }
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const datesDisplay = `${start.toLocaleDateString('en-US', dateOptions)} - ${end.toLocaleDateString('en-US', dateOptions)}`;
    const newTrip: Trip = {
      id: newId,
      title: data.title,
      dates: datesDisplay,
      coverUrl: `https://picsum.photos/seed/${newId}/800/600`,
      vibeColor: "bg-stone-200",
      itinerary: newItinerary
    };

    setAllTrips(prev => [...prev, newTrip]);
    setSelectedTripId(newId);
    addToast('success', 'New trip created!');
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setAllTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const handleDeleteTrip = (tripId: string) => {
    setAllTrips(prev => prev.map(t => t.id === tripId ? { ...t, deleted: true } : t));
    if (selectedTripId === tripId) setSelectedTripId(null);
    addToast('success', 'Trip moved to Recycle Bin.');
  };

  const handleRestoreTrip = (tripId: string) => {
    setAllTrips(prev => prev.map(t => t.id === tripId ? { ...t, deleted: false } : t));
    addToast('success', 'Trip restored!');
  };

  const handlePermanentDelete = (tripId: string) => {
    setAllTrips(prev => prev.filter(t => t.id !== tripId));
    addToast('success', 'Trip permanently deleted.');
  };

  // --- Render ---
  const visibleTrips = allTrips.filter(t => !t.deleted);
  const selectedTrip = allTrips.find(t => t.id === selectedTripId) || null;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${theme === 'dark' ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50'}`}>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!selectedTrip ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TripListHome 
              trips={visibleTrips} 
              userAvatar={userAvatar}
              onUpdateAvatar={setUserAvatar}
              onSelectTrip={(trip) => setSelectedTripId(trip.id)}
              onCreateTrip={() => setIsCreateModalOpen(true)}
              onDeleteTrip={handleDeleteTrip}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onRestartOnboarding={handleRestartOnboarding} // 传递教程重启方法
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TripDetail 
              trip={selectedTrip} 
              onUpdateTrip={handleUpdateTrip}
              onBack={() => setSelectedTripId(null)}
              onOpenSettings={() => setIsSettingsOpen(true)} // 传递设置方法
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateTripModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateTrip}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
            <SettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                allTrips={allTrips}
                userAvatar={userAvatar} 
                onImportData={handleImportData} 
                onResetToDemo={handleResetToDemo} 
                onRestoreTrip={handleRestoreTrip}
                onPermanentDelete={handlePermanentDelete}
                onClearAllData={handleClearAllData}
                theme={theme}
                onThemeChange={setTheme}
            />
        )}
      </AnimatePresence>
    </div>
  );
}
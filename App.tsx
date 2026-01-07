
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TripListHome from './components/TripListHome';
import TripDetail from './components/TripDetail';
import { CreateTripModal } from './components/Modals';
import { Trip, DayItinerary } from './types';
import { INITIAL_TRIPS } from './data';

export default function App() {
  // 1. Trip State: Load from localStorage or use Default
  const [allTrips, setAllTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('vibe_trips_data');
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch (e) {
      console.error("Failed to load trips", e);
      return INITIAL_TRIPS;
    }
  });

  // 2. Avatar State: Load from localStorage or use Default
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('vibe_user_avatar');
      return saved || "https://picsum.photos/id/64/100/100";
    } catch (e) {
      return "https://picsum.photos/id/64/100/100";
    }
  });

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 3. Persistence Effects
  useEffect(() => {
    localStorage.setItem('vibe_trips_data', JSON.stringify(allTrips));
  }, [allTrips]);

  useEffect(() => {
    localStorage.setItem('vibe_user_avatar', userAvatar);
  }, [userAvatar]);

  const selectedTrip = allTrips.find(t => t.id === selectedTripId) || null;

  // 4. Create Trip Logic
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

    // Format display dates
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
    setSelectedTripId(newId); // Auto-navigate
  };

  // 5. Update Trip Logic
  const handleUpdateTrip = (updatedTrip: Trip) => {
    setAllTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  // 6. Delete Trip Logic
  const handleDeleteTrip = (tripId: string) => {
    setAllTrips(prev => prev.filter(t => t.id !== tripId));
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <AnimatePresence mode="wait">
        {!selectedTrip ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TripListHome 
              trips={allTrips} 
              userAvatar={userAvatar}
              onUpdateAvatar={setUserAvatar}
              onSelectTrip={(trip) => setSelectedTripId(trip.id)}
              onCreateTrip={() => setIsCreateModalOpen(true)}
              onDeleteTrip={handleDeleteTrip}
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
    </div>
  );
}


import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Plus, Settings, Check, Trash2 } from 'lucide-react';
import { DayItinerary, Activity, Trip } from '../types';
import ActivityCard from './ActivityCard';
import DetailView from './DetailView';
import { ActivityModal } from './Modals';

interface TripDetailProps {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  onBack: () => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onUpdateTrip, onBack }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // UI State
  const [isEditMode, setIsEditMode] = useState(false);

  // Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Derived state for the currently open detail view
  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return null;
    for (const day of trip.itinerary) {
      const found = day.activities.find(a => a.id === selectedActivityId);
      if (found) return found;
    }
    return null;
  }, [trip.itinerary, selectedActivityId]);

  // Derived state for the activity being edited in the Modal
  const activityToEdit = useMemo(() => {
    if (editingActivityId) {
        for (const day of trip.itinerary) {
            const found = day.activities.find(a => a.id === editingActivityId);
            if (found) return found;
        }
    }
    return undefined;
  }, [trip.itinerary, editingActivityId]);

  // --- Helpers ---
  
  const getMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const startPart = timeStr.split('-')[0].trim();
    const [h, m] = startPart.split(':');
    return (parseInt(h) || 0) * 60 + (parseInt(m) || 0);
  };

  const sortActivities = (activities: Activity[]) => {
      return [...activities].sort((a, b) => getMinutes(a.time_range) - getMinutes(b.time_range));
  };

  const formatDateHeader = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // --- Actions ---

  // 1. Delete Activity (Edit Mode Action)
  const handleDeleteActivityFromDay = (dayIndex: number, activityId: string) => {
      const newItinerary = [...trip.itinerary];
      newItinerary[dayIndex] = {
          ...newItinerary[dayIndex],
          activities: newItinerary[dayIndex].activities.filter(a => a.id !== activityId)
      };
      onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  // 2. Delete Entire Day
  const handleDeleteDay = (e: React.MouseEvent, dayIndex: number) => {
      e.stopPropagation(); // Prevents bubbling
      // Removed window.confirm. In edit mode, the button is explicit.
      const newItinerary = trip.itinerary.filter((_, idx) => idx !== dayIndex);
      onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  // 3. Add Activity Logic
  const handleOpenCreateModal = (dayIndex: number) => {
      if (isEditMode) return; // Disable adding in edit mode
      setActiveDayIndex(dayIndex);
      setModalMode('create');
      setEditingActivityId(null);
      setIsActivityModalOpen(true);
  };

  // 4. Modal Submit Logic
  const handleModalSubmit = (data: Partial<Activity>) => {
      if (modalMode === 'create') {
          // CREATE NEW
          const newActivity: Activity = {
              id: `act_${Date.now()}`,
              time_range: data.time_range || "09:00 - 10:00",
              title: data.title || "New Activity",
              location: data.location || "",
              category: data.category || 'spot',
              vibe_color: data.vibe_color || 'bg-stone-300',
              text_color: data.text_color || 'text-stone-900',
              image_url: `https://picsum.photos/seed/${Date.now()}/800/600`,
              description: "Tap to add details...",
              user_note: "",
              media: [],
              blocks: []
          };

          const newItinerary = [...trip.itinerary];
          newItinerary[activeDayIndex] = {
              ...newItinerary[activeDayIndex],
              activities: sortActivities([...newItinerary[activeDayIndex].activities, newActivity])
          };
          onUpdateTrip({ ...trip, itinerary: newItinerary });

      } else if (modalMode === 'edit' && editingActivityId) {
          // EDIT EXISTING
          const newItinerary = trip.itinerary.map(day => {
              const hasActivity = day.activities.some(a => a.id === editingActivityId);
              if (hasActivity) {
                  const updatedActivities = day.activities.map(a => 
                      a.id === editingActivityId ? { ...a, ...data } : a
                  );
                  return { ...day, activities: sortActivities(updatedActivities) };
              }
              return day;
          });
          onUpdateTrip({ ...trip, itinerary: newItinerary });
      }
  };

  // 5. Add New Day Logic
  const handleAddDay = () => {
    if (isEditMode) return;
    const lastDay = trip.itinerary[trip.itinerary.length - 1];
    
    // Calculate next date safely
    let nextDateStr = new Date().toISOString().split('T')[0];
    if (lastDay) {
        const [y, m, d] = lastDay.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateObj.setDate(dateObj.getDate() + 1);
        
        const nextY = dateObj.getFullYear();
        const nextM = String(dateObj.getMonth() + 1).padStart(2, '0');
        const nextD = String(dateObj.getDate()).padStart(2, '0');
        nextDateStr = `${nextY}-${nextM}-${nextD}`;
    }
    
    const newDay: DayItinerary = {
      date: nextDateStr,
      dayLabel: `Day ${trip.itinerary.length + 1}`, // This label might need re-calc if days deleted
      activities: []
    };

    const newItinerary = [...trip.itinerary, newDay];
    onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  const handleEditInfoModal = (actId: string) => {
      setEditingActivityId(actId);
      setModalMode('edit');
      setIsActivityModalOpen(true);
  };
  
  const handleDetailUpdate = (id: string, updates: Partial<Activity>) => {
    const newItinerary = trip.itinerary.map(day => ({
      ...day,
      activities: day.activities.map(act => 
        act.id === id ? { ...act, ...updates } : act
      )
    }));
    onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-rose-200 selection:text-rose-900 pb-20">
      
      {/* Header - Sticky */}
      <header className="sticky top-0 z-30 px-4 py-4 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200 transition-all duration-300 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-stone-900 truncate max-w-[150px] sm:max-w-xs">
                {trip.title}
            </h1>
        </div>

        {/* EDIT / DONE Toggle */}
        <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                isEditMode 
                ? 'bg-stone-900 text-white shadow-lg' 
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
        >
            {isEditMode ? 'Done' : 'Edit'}
        </button>
      </header>

      {/* Main Content */}
      <main className="px-4 max-w-2xl mx-auto overflow-hidden">
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`transition-opacity duration-300 ${selectedActivityId ? 'opacity-0' : 'opacity-100'}`}
          >
            {trip.itinerary.map((day, dayIndex) => (
              <div key={day.date + "_" + dayIndex} className="mb-12">
                {/* Day Header */}
                <div className="pt-8 pb-4 mb-2 border-b border-stone-200 flex justify-between items-end">
                   <h2 className="text-2xl font-bold text-stone-300 flex items-baseline gap-3">
                     <span className="text-stone-900">Day {dayIndex + 1}</span> 
                     <span className="text-lg font-medium tracking-wide text-stone-400">· {formatDateHeader(day.date)}</span>
                   </h2>
                   
                   {/* Delete Day Button (Only in Edit Mode) */}
                   <AnimatePresence>
                        {isEditMode && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={(e) => handleDeleteDay(e, dayIndex)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors mb-1 cursor-pointer z-10"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        )}
                   </AnimatePresence>
                </div>

                {/* Activities Grid */}
                <div className="space-y-4">
                  {/* Empty State */}
                  {day.activities.length === 0 && (
                      <div className="py-8 text-center border-2 border-dashed border-stone-200 rounded-3xl">
                          <p className="text-stone-400 font-medium text-sm">No activities planned</p>
                      </div>
                  )}

                  <AnimatePresence initial={false}>
                    {day.activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      >
                        <ActivityCard 
                          activity={activity} 
                          isEditMode={isEditMode}
                          onClick={setSelectedActivityId} 
                          onDelete={() => handleDeleteActivityFromDay(dayIndex, activity.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Add Activity Button (Hidden in Edit Mode) */}
                  {!isEditMode && (
                    <motion.button 
                        layout
                        onClick={() => handleOpenCreateModal(dayIndex)}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(245, 245, 244, 0.8)" }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-16 rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-300 hover:text-stone-500 hover:border-stone-300 transition-all group"
                    >
                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                    </motion.button>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Day Button (Hidden in Edit Mode) */}
            {!isEditMode && (
                <div className="mt-8 pb-12">
                <button
                    onClick={handleAddDay}
                    className="w-full py-5 rounded-3xl bg-stone-900 text-stone-50 font-bold text-lg shadow-lg shadow-stone-200 hover:bg-stone-800 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} />
                    Add New Day
                </button>
                </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedActivityId && selectedActivity && (
          <DetailView
            activity={selectedActivity}
            onClose={() => setSelectedActivityId(null)}
            onUpdateActivity={handleDetailUpdate}
            onEditInfo={() => handleEditInfoModal(selectedActivity.id)}
          />
        )}
      </AnimatePresence>

      {/* Create/Edit Activity Modal */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <ActivityModal
            isOpen={isActivityModalOpen}
            onClose={() => setIsActivityModalOpen(false)}
            onSubmit={handleModalSubmit}
            onDelete={undefined} // Modal delete is secondary now, but keeping prop if needed
            initialData={activityToEdit}
            mode={modalMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetail;

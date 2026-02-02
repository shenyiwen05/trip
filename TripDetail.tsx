import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, BarChart2, Layout, Briefcase, Sun, Cloud, CloudRain, Wind, Settings } from 'lucide-react';
import { DayItinerary, Activity, Trip } from '../types';
import ActivityCard from './ActivityCard';
import DetailView from './DetailView';
import { ActivityModal } from './Modals';

// Modules
import BudgetChart from './Analytics/BudgetChart';
import TimeDistribution from './Analytics/TimeDistribution';
import FootprintMap from './Analytics/FootprintMap';
import PackingList from './Tools/PackingList';

interface TripDetailProps {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  onBack: () => void;
  onOpenSettings: () => void; // 新增
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onUpdateTrip, onBack, onOpenSettings }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // UI State
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'itinerary' | 'analytics'>('itinerary');
  const [isPackingListOpen, setIsPackingListOpen] = useState(false);

  // Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Derived state
  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return null;
    for (const day of trip.itinerary) {
      const found = day.activities.find(a => a.id === selectedActivityId);
      if (found) return found;
    }
    return null;
  }, [trip.itinerary, selectedActivityId]);

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

  const getSimulatedWeather = (dateStr: string) => {
    const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const weathers = ['sun', 'cloud', 'rain', 'wind'];
    const type = weathers[hash % weathers.length];
    switch(type) {
        case 'sun': return <Sun size={18} className="text-orange-400" />;
        case 'cloud': return <Cloud size={18} className="text-stone-400 dark:text-stone-500" />;
        case 'rain': return <CloudRain size={18} className="text-blue-400" />;
        case 'wind': return <Wind size={18} className="text-teal-400" />;
        default: return <Sun size={18} className="text-orange-400" />;
    }
  };
  
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

  const scrollToDay = (index: number) => {
      const element = document.getElementById(`day-${index}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  // --- Actions ---

  const handleDeleteActivityFromDay = (dayIndex: number, activityId: string) => {
      const newItinerary = [...trip.itinerary];
      newItinerary[dayIndex] = {
          ...newItinerary[dayIndex],
          activities: newItinerary[dayIndex].activities.filter(a => a.id !== activityId)
      };
      onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  const handleDeleteDay = (e: React.MouseEvent, dayIndex: number) => {
      e.stopPropagation(); 
      const newItinerary = trip.itinerary.filter((_, idx) => idx !== dayIndex);
      onUpdateTrip({ ...trip, itinerary: newItinerary });
  };

  const handleOpenCreateModal = (dayIndex: number) => {
      if (isEditMode) return;
      setActiveDayIndex(dayIndex);
      setModalMode('create');
      setEditingActivityId(null);
      setIsActivityModalOpen(true);
  };

  const handleModalSubmit = (data: Partial<Activity>) => {
      if (modalMode === 'create') {
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
              blocks: [],
              cost: data.cost || 0
          };

          const newItinerary = [...trip.itinerary];
          newItinerary[activeDayIndex] = {
              ...newItinerary[activeDayIndex],
              activities: sortActivities([...newItinerary[activeDayIndex].activities, newActivity])
          };
          onUpdateTrip({ ...trip, itinerary: newItinerary });

      } else if (modalMode === 'edit' && editingActivityId) {
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

  const handleAddDay = () => {
    if (isEditMode) return;
    const lastDay = trip.itinerary[trip.itinerary.length - 1];
    
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
      dayLabel: `Day ${trip.itinerary.length + 1}`,
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 selection:bg-rose-200 selection:text-rose-900 pb-20 transition-colors duration-300">
      
      {/* Header - Sticky */}
      <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 transition-all duration-300 h-16 md:h-20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors border border-transparent hover:border-stone-300 dark:hover:border-stone-700"
            >
                <ChevronLeft size={24} />
            </button>
            <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-stone-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                    {trip.title}
                </h1>
                <p className="text-xs text-stone-400 dark:text-stone-500 font-medium hidden sm:block">{trip.dates}</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Tools Group */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full p-1 shadow-sm transition-colors">
                <button
                    onClick={() => setIsPackingListOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-all"
                    title="Packing List"
                >
                    <Briefcase size={18} />
                </button>
                {/* 新增：Settings 按钮 */}
                <button
                    onClick={onOpenSettings}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-all"
                    title="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>

            <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 hidden sm:block" />

            {/* View Toggle */}
            <div className="flex bg-stone-200/50 dark:bg-stone-800/50 p-1 rounded-full">
                <button
                    onClick={() => setViewMode('itinerary')}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${
                        viewMode === 'itinerary' 
                        ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                    }`}
                >
                    <Layout size={16} />
                    <span className="hidden sm:inline">Plan</span>
                </button>
                <button
                    onClick={() => setViewMode('analytics')}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${
                        viewMode === 'analytics' 
                        ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-white' 
                        : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                    }`}
                >
                    <BarChart2 size={16} />
                    <span className="hidden sm:inline">Stats</span>
                </button>
            </div>

            {/* Edit Toggle */}
            <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`ml-2 px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                    isEditMode 
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-black dark:hover:bg-white' 
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
                }`}
            >
                {isEditMode ? 'Done' : 'Edit'}
            </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-12">
        <AnimatePresence mode='wait'>
            {viewMode === 'itinerary' ? (
                // --- ITINERARY VIEW ---
                <motion.div
                    key="itinerary-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col lg:flex-row gap-10"
                >
                    {/* Left Sidebar: Navigation */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-28 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4 px-2">Timeline</p>
                            {trip.itinerary.map((day, idx) => (
                                <button
                                    key={`nav-${idx}`}
                                    onClick={() => scrollToDay(idx)}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-between group"
                                >
                                    <span className="font-bold text-stone-600 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white">Day {idx + 1}</span>
                                    <span className="text-xs text-stone-400 font-mono">{day.date.split('-').slice(1).join('/')}</span>
                                </button>
                            ))}
                            {!isEditMode && (
                                <button
                                    onClick={handleAddDay}
                                    className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:border-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center gap-2 mt-4"
                                >
                                    <Plus size={16} />
                                    <span className="font-bold text-sm">Add Day</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Content: Days Stream */}
                    <div className="flex-1 space-y-16 pb-20">
                        {trip.itinerary.map((day, dayIndex) => (
                        <div key={day.date + "_" + dayIndex} id={`day-${dayIndex}`} className="scroll-mt-28">
                            {/* Day Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex flex-col items-center justify-center font-bold shadow-md">
                                    <span className="text-xs opacity-50 uppercase">Day</span>
                                    <span className="text-xl leading-none">{dayIndex + 1}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                        {formatDateHeader(day.date)}
                                        {/* Weather Badge */}
                                        <div className="ml-3 px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-md flex items-center gap-1.5 text-stone-500" title="Forecast">
                                            {getSimulatedWeather(day.date)}
                                        </div>
                                    </h2>
                                    <p className="text-stone-400 dark:text-stone-500 text-sm font-medium">
                                        {day.activities.length} activities · {day.activities.length > 0 ? "Busy day" : "Free time"}
                                    </p>
                                </div>
                                
                                {/* Delete Day (Edit Mode) */}
                                {isEditMode && (
                                    <button
                                        onClick={(e) => handleDeleteDay(e, dayIndex)}
                                        className="ml-auto p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Activities List */}
                            <div className="space-y-4 pl-0 md:pl-4 border-l-2 border-stone-100 dark:border-stone-800 ml-6 md:ml-6">
                                {day.activities.length === 0 && (
                                    <div className="ml-4 py-8 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl">
                                        <p className="text-stone-400 dark:text-stone-600 font-medium text-sm">No activities planned</p>
                                    </div>
                                )}

                                <AnimatePresence initial={false}>
                                    {day.activities.map((activity) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="pl-4 md:pl-8 relative"
                                    >
                                        {/* Timeline Dot */}
                                        <div className="absolute left-[-5px] top-8 w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-600 border-2 border-white dark:border-stone-900 ring-1 ring-stone-100 dark:ring-stone-800" />
                                        
                                        <ActivityCard 
                                            activity={activity} 
                                            isEditMode={isEditMode}
                                            onClick={setSelectedActivityId} 
                                            onDelete={() => handleDeleteActivityFromDay(dayIndex, activity.id)}
                                        />
                                    </motion.div>
                                    ))}
                                </AnimatePresence>
                            
                                {!isEditMode && (
                                    <motion.div className="pl-4 md:pl-8 pt-2">
                                        <button 
                                            onClick={() => handleOpenCreateModal(dayIndex)}
                                            className="w-full h-14 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all gap-2 group"
                                        >
                                            <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="font-bold text-sm">Add Activity</span>
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        ))}

                        {!isEditMode && (
                            <div className="pt-8 pb-12 flex justify-center">
                                <button
                                    onClick={handleAddDay}
                                    className="px-8 py-4 rounded-full bg-stone-900 dark:bg-white text-stone-50 dark:text-stone-900 font-bold shadow-lg shadow-stone-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Add New Day
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                // --- ANALYTICS VIEW ---
                <motion.div
                    key="analytics-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-stone-900 dark:text-white">Trip Analytics</h2>
                        <div className="flex gap-2">
                             <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                                Real-time Data
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Map */}
                        <div className="lg:col-span-2 h-80 lg:h-[500px] shadow-sm rounded-[2rem] overflow-hidden border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-800">
                            <FootprintMap />
                        </div>
                        
                        {/* Budget Chart */}
                        <div className="h-80 lg:h-[500px] bg-white dark:bg-stone-800 rounded-[2rem] p-2 border border-stone-100 dark:border-stone-800">
                            <BudgetChart trip={trip} />
                        </div>
                    </div>

                    {/* Time Distribution */}
                    <div className="h-80 w-full bg-white dark:bg-stone-800 rounded-[2rem] p-2 border border-stone-100 dark:border-stone-800">
                        <TimeDistribution trip={trip} />
                    </div>
                    
                    <div className="h-20" />
                </motion.div>
            )}
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

      {/* Modals */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <ActivityModal
            isOpen={isActivityModalOpen}
            onClose={() => setIsActivityModalOpen(false)}
            onSubmit={handleModalSubmit}
            onDelete={undefined} 
            initialData={activityToEdit}
            mode={modalMode}
          />
        )}
      </AnimatePresence>

      {/* Packing List Modal */}
      <AnimatePresence>
        {isPackingListOpen && (
            <PackingList 
                trip={trip}
                onUpdateTrip={onUpdateTrip}
                onClose={() => setIsPackingListOpen(false)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetail;
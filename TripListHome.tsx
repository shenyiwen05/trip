import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles, Plus, Minus, Camera, Settings, Map, Search, XCircle, GraduationCap } from 'lucide-react';
import { Trip } from '../types';

interface TripListHomeProps {
  trips: Trip[];
  userAvatar: string;
  onUpdateAvatar: (url: string) => void;
  onSelectTrip: (trip: Trip) => void;
  onCreateTrip: () => void;
  onDeleteTrip: (id: string) => void;
  onOpenSettings: () => void;
  onRestartOnboarding: () => void; // 新增
}

const TripCard: React.FC<{ 
    trip: Trip; 
    onSelect: () => void; 
    onDelete: () => void;
    isEditMode: boolean;
}> = ({ trip, onSelect, onDelete, isEditMode }) => {
    const handleCardClick = () => {
        if (isEditMode) return;
        onSelect();
    };

    return (
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/3] group select-none">
             {isEditMode && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-rose-600 active:scale-90 z-50 border-4 border-stone-50 dark:border-stone-900 cursor-pointer transition-transform animate-in fade-in zoom-in duration-200"
                >
                    <Minus size={20} strokeWidth={4} />
                </button>
             )}

             <motion.div
                layoutId={`trip-card-${trip.id}`}
                onClick={handleCardClick}
                whileHover={!isEditMode ? { y: -8, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" } : undefined}
                whileTap={!isEditMode ? { scale: 0.98 } : undefined}
                className={`relative h-full w-full rounded-[2rem] overflow-hidden shadow-lg bg-white dark:bg-stone-800 z-10 transition-all duration-300 ${isEditMode ? 'cursor-default opacity-90 grayscale-[0.5]' : 'cursor-pointer'}`}
             >
                <img src={trip.coverUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${trip.vibeColor} text-black/80 shadow-sm`}>
                        {trip.dates === "TBD" ? "Planning" : "Upcoming"}
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md line-clamp-2 leading-tight">{trip.title}</h2>
                    
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-white/90 text-xs font-semibold backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                            <Calendar size={12} />
                            <span>{trip.dates}</span>
                        </div>
                        
                        {!isEditMode && (
                            <div className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <ArrowRight size={20} />
                            </div>
                        )}
                    </div>
                </div>
             </motion.div>
        </div>
    );
};

const TripListHome: React.FC<TripListHomeProps> = ({ trips, userAvatar, onUpdateAvatar, onSelectTrip, onCreateTrip, onDeleteTrip, onOpenSettings, onRestartOnboarding }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      onUpdateAvatar(imageUrl);
    }
  };

  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return trips;
    const lowerQ = searchQuery.toLowerCase();
    return trips.filter(t => 
        t.title.toLowerCase().includes(lowerQ) || 
        t.dates.toLowerCase().includes(lowerQ)
    );
  }, [trips, searchQuery]);

  return (
    <div className="flex flex-col flex-1">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 px-6 py-4 md:px-12 md:py-6 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-stone-900 shadow-lg transition-colors">
                <Map size={20} />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-stone-900 dark:text-white flex items-center gap-2 transition-colors">
                    Travel Planner <Sparkles className="text-yellow-400 fill-yellow-400" size={18} />
                </h1>
                <p className="text-xs md:text-sm text-stone-400 font-medium hidden sm:block">Intelligent Itinerary Management v1.0</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
             <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all border ${
                    isEditMode 
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900' 
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
            >
                {isEditMode ? 'Done' : 'Manage'}
            </button>

            <div className="h-6 w-px bg-stone-200 dark:bg-stone-700 mx-1 hidden sm:block"></div>

            {/* Tutorial Button (新增) */}
            <button 
                onClick={onRestartOnboarding}
                className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center transition-all hidden sm:flex"
                title="Restart Tutorial"
            >
                <GraduationCap size={18} />
            </button>

            <button 
                onClick={onOpenSettings}
                className="w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center transition-all"
                title="Settings"
            >
                <Settings size={18} />
            </button>

            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden border-2 border-white dark:border-stone-600 shadow-md relative hover:ring-2 hover:ring-stone-200 dark:hover:ring-stone-500 transition-all">
                    <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={16} className="text-white" />
                    </div>
                </div>
            </div>
        </div>

        <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 flex-1 w-full">
        
        {/* Title & Search Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-2xl md:text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Your Trips</h2>
                <p className="text-stone-400 font-medium">{trips.length} adventures planned</p>
            </div>

            <div className="relative w-full md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full pl-11 pr-4 py-3 text-sm font-bold text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-500 shadow-sm transition-all placeholder:text-stone-400"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
                    >
                        <XCircle size={16} />
                    </button>
                )}
            </div>
        </div>

        {/* Content Area */}
        {filteredTrips.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {/* Create New Trip Card */}
                {!isEditMode && !searchQuery && (
                    <motion.button 
                        onClick={onCreateTrip}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/3] rounded-[2rem] border-3 border-dashed border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center gap-4 text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 transition-all bg-transparent group"
                    >
                        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 group-hover:bg-white dark:group-hover:bg-stone-700 flex items-center justify-center transition-colors shadow-sm">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold text-lg">Create New</span>
                    </motion.button>
                )}

                {filteredTrips.map((trip) => (
                    <TripCard 
                        key={trip.id}
                        trip={trip}
                        isEditMode={isEditMode}
                        onSelect={() => onSelectTrip(trip)}
                        onDelete={() => onDeleteTrip(trip.id)}
                    />
                ))}
            </div>
        ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-6 transition-colors">
                    {searchQuery ? <Search size={40} className="text-stone-300" /> : <Map size={40} className="text-stone-300" />}
                </div>
                <h3 className="text-xl font-black text-stone-800 dark:text-white mb-2 transition-colors">
                    {searchQuery ? `No trips found for "${searchQuery}"` : "No trips yet"}
                </h3>
                <p className="text-stone-400 max-w-xs mx-auto mb-8">
                    {searchQuery ? "Try a different keyword or date." : "Start your journey by creating your first vibe plan."}
                </p>
                {!searchQuery && (
                    <button 
                        onClick={onCreateTrip}
                        className="px-8 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        Create First Trip
                    </button>
                )}
            </div>
        )}
      </div>

      <footer className="py-6 text-center text-xs text-stone-300 dark:text-stone-600 font-medium border-t border-stone-100 dark:border-stone-800 mt-auto transition-colors">
         <p>Travel Planner System v1.0.0 © 2026</p>
      </footer>
    </div>
  );
};

export default TripListHome;

import React, { useState, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles, Plus, Trash2, Camera } from 'lucide-react';
import { Trip } from '../types';

interface TripListHomeProps {
  trips: Trip[];
  userAvatar: string;
  onUpdateAvatar: (url: string) => void;
  onSelectTrip: (trip: Trip) => void;
  onCreateTrip: () => void;
  onDeleteTrip: (id: string) => void;
}

const TripCardSwipe: React.FC<{ trip: Trip; onSelect: () => void; onDelete: () => void }> = ({ trip, onSelect, onDelete }) => {
    const controls = useAnimation();
    const [isSwiped, setIsSwiped] = useState(false);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const threshold = -80;
        if (info.offset.x < threshold) {
            setIsSwiped(true);
            await controls.start({ x: -120 });
        } else {
            setIsSwiped(false);
            await controls.start({ x: 0 });
        }
    };

    const handleTap = () => {
        if (isSwiped) {
            setIsSwiped(false);
            controls.start({ x: 0 });
        } else {
            onSelect();
        }
    };

    return (
        <div className="relative w-full h-72 mb-8 select-none">
             {/* Delete Action Background - z-0 */}
             <div className="absolute inset-0 rounded-[2.5rem] bg-rose-100 flex justify-end items-center pr-10 z-0">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Immediate visual confirmation handled by parent
                        onDelete();
                    }}
                    className="flex flex-col items-center gap-2 text-rose-600 font-bold opacity-100 hover:scale-110 transition-all cursor-pointer"
                >
                    <div className="w-14 h-14 rounded-full bg-rose-500 shadow-lg text-white flex items-center justify-center">
                        <Trash2 size={24} />
                    </div>
                    <span className="text-xs uppercase tracking-wider">Delete</span>
                </button>
             </div>

             {/* Foreground Card - z-10 */}
             <motion.div
                layoutId={`trip-card-${trip.id}`}
                drag="x"
                // Allow small right drag (20px) to prevent accidental clicks
                dragConstraints={{ left: -140, right: 20 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                onTap={handleTap}
                whileTap={{ scale: 0.98 }}
                className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing bg-white z-10 touch-pan-y"
             >
                <img src={trip.coverUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none" />
                
                <div className="absolute bottom-0 left-0 p-8 w-full pointer-events-none">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${trip.vibeColor} text-black/80 shadow-sm`}>
                    {trip.dates === "TBD" ? "Planning" : "Upcoming"}
                </div>
                <h2 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-md">{trip.title}</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/90 text-sm font-semibold backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Calendar size={14} />
                    <span>{trip.dates}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg">
                    <ArrowRight size={24} />
                    </div>
                </div>
                </div>
             </motion.div>
        </div>
    );
};

const TripListHome: React.FC<TripListHomeProps> = ({ trips, userAvatar, onUpdateAvatar, onSelectTrip, onCreateTrip, onDeleteTrip }) => {
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

  return (
    <div className="min-h-screen bg-stone-50 p-6 pt-12 pb-20">
      <header className="max-w-md mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-stone-900 mb-1 flex items-center gap-2">
            My Trips <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
          </h1>
          <p className="text-stone-400 font-medium">Ready for ur next trip?</p>
        </div>
        
        {/* Editable Avatar */}
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden border-2 border-white shadow-sm relative">
                <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={16} className="text-white" />
                </div>
            </div>
        </div>
        <input 
            type="file" 
            ref={avatarInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
        />
      </header>

      <div className="max-w-md mx-auto">
        {trips.map((trip) => (
            <TripCardSwipe 
                key={trip.id}
                trip={trip}
                onSelect={() => onSelectTrip(trip)}
                onDelete={() => onDeleteTrip(trip.id)}
            />
        ))}
        
        {/* Create Trip Button */}
        <motion.button 
          onClick={onCreateTrip}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(245, 245, 244, 0.8)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-32 rounded-[2.5rem] border-3 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 text-stone-300 hover:text-stone-500 hover:border-stone-300 transition-all bg-white"
        >
          <Plus size={32} />
          <span className="font-bold text-lg">Create New Vibe</span>
        </motion.button>
      </div>
    </div>
  );
};

export default TripListHome;

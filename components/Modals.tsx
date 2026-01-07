import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Palette, MapPin, Utensils, Car, Coffee, Trash2, Camera } from 'lucide-react';
import { Activity, Category } from '../types';

// --- Constants ---

export const VIBE_COLORS = [
  { bg: 'bg-orange-300', text: 'text-orange-950', name: 'Sunrise' },
  { bg: 'bg-sky-300', text: 'text-sky-950', name: 'Daydream' },
  { bg: 'bg-lime-300', text: 'text-lime-950', name: 'Matcha' },
  { bg: 'bg-violet-300', text: 'text-violet-950', name: 'Twilight' },
  { bg: 'bg-rose-300', text: 'text-rose-950', name: 'Sakura' },
  { bg: 'bg-teal-300', text: 'text-teal-950', name: 'Ocean' },
  { bg: 'bg-amber-300', text: 'text-amber-950', name: 'Honey' },
  { bg: 'bg-emerald-300', text: 'text-emerald-950', name: 'Forest' },
  { bg: 'bg-indigo-300', text: 'text-indigo-950', name: 'Deep' },
  { bg: 'bg-stone-300', text: 'text-stone-900', name: 'Minimal' },
];

const CATEGORIES: { id: Category; label: string; icon: any }[] = [
    { id: 'spot', label: 'Spot', icon: Camera },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'chill', label: 'Chill', icon: Coffee },
    { id: 'transport', label: 'Travel', icon: Car },
];

// --- Components ---

interface ModalBackdropProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative"
    >
      {children}
    </motion.div>
  </motion.div>
);

// --- Create Trip Modal ---

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; startDate: string; endDate: string }) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && startDate && endDate) {
      onSubmit({ title, startDate, endDate });
      onClose();
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-stone-800">New Journey</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} className="text-stone-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Trip Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kyoto Spring"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-lg font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-95 transition-transform shadow-lg"
          >
            Create Trip
          </button>
        </form>
      </div>
    </ModalBackdrop>
  );
};

// --- Edit/Create Activity Modal ---

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Activity>) => void;
  onDelete?: () => void;
  initialData?: Partial<Activity>;
  mode: 'create' | 'edit';
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, mode }) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedColor, setSelectedColor] = useState(VIBE_COLORS[0]);
  const [category, setCategory] = useState<Category>('spot');

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setLocation(initialData?.location || '');
      setCategory(initialData?.category || 'spot');
      
      // Parse time range "09:00 - 10:00"
      if (initialData?.time_range) {
        const [start, end] = initialData.time_range.split('-').map(s => s.trim());
        if (start) setStartTime(start);
        if (end) setEndTime(end);
      } else {
         setStartTime('09:00');
         setEndTime('10:00');
      }

      const foundColor = VIBE_COLORS.find(c => c.bg === initialData?.vibe_color);
      if (foundColor) setSelectedColor(foundColor);
      else if (!initialData?.vibe_color) setSelectedColor(VIBE_COLORS[Math.floor(Math.random() * VIBE_COLORS.length)]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      location,
      time_range: `${startTime} - ${endTime}`,
      vibe_color: selectedColor.bg,
      text_color: selectedColor.text,
      category: category,
    });
    onClose();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className={`h-4 w-full ${selectedColor.bg}`} />
      <div className="p-8 max-h-[85vh] overflow-y-auto no-scrollbar">
        <h2 className="text-2xl font-black text-stone-800 mb-6">
          {mode === 'create' ? 'Add Activity' : 'Edit Details'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">What's the plan?</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Coffee at Blue Bottle"
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-lg font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Where is it?</label>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Shibuya Crossing"
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                />
            </div>
          </div>

           {/* Category Selection */}
           <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Vibe Type</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 transition-all ${isSelected ? 'border-stone-900 bg-stone-100 text-stone-900' : 'border-stone-100 bg-white text-stone-400 hover:border-stone-200'}`}
                    >
                        <Icon size={20} />
                        <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                    </button>
                  );
              })}
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-stone-900"
                required
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Palette size={14} /> Vibe Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {VIBE_COLORS.map((color) => (
                <button
                  key={color.bg}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-full ${color.bg} flex items-center justify-center transition-transform hover:scale-110 ${selectedColor.bg === color.bg ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : ''}`}
                >
                  {selectedColor.bg === color.bg && <Check size={16} className={color.text} />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${selectedColor.bg} ${selectedColor.text} font-bold py-4 rounded-2xl mt-4 hover:brightness-105 active:scale-95 transition-all shadow-lg`}
          >
            {mode === 'create' ? 'Add to Itinerary' : 'Save Changes'}
          </button>
          
          {/* Delete Button (Only in Edit Mode) */}
          {mode === 'edit' && onDelete && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                }}
                className="w-full bg-red-50 text-red-500 font-bold py-3 rounded-2xl mt-2 hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Activity
              </button>
          )}

        </form>
      </div>
    </ModalBackdrop>
  );
};
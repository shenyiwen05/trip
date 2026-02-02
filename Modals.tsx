import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Palette, MapPin, Utensils, Car, Coffee, 
  Trash2, Camera, Sun, Moon, Monitor, Upload, Download, 
  FileText, AlertTriangle, RefreshCcw 
} from 'lucide-react';
import { Trip, Activity, Category } from '../types';
import { exportTripToMarkdown, downloadFile } from '../utils/exportUtils';

// --- Constants ---

export const THEME_COLORS = [
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
      className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative transition-colors duration-300"
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
          <h2 className="text-2xl font-black text-stone-800 dark:text-white">Plan New Trip</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
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
              className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-lg font-bold text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white transition-all"
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
                className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-stone-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white"
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
                className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-stone-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold py-4 rounded-2xl mt-4 hover:scale-[1.02] active:scale-95 transition-transform shadow-lg"
          >
            Create Trip
          </button>
        </form>
      </div>
    </ModalBackdrop>
  );
};

// --- Settings Modal ---

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTrips: Trip[];
  userAvatar: string;
  onImportData: (data: any) => void;
  onRestoreTrip: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onClearAllData: () => void;
  onResetToDemo: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, allTrips, userAvatar, onImportData, 
    onRestoreTrip, onPermanentDelete, onClearAllData, onResetToDemo,
    theme, onThemeChange
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'recycle'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const deletedTrips = allTrips.filter(t => t.deleted);
  const activeTrips = allTrips.filter(t => !t.deleted);

  const handleExportBackup = () => {
      const backupData = {
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          userAvatar: userAvatar,
          trips: allTrips 
      };
      const json = JSON.stringify(backupData, null, 2);
      downloadFile(`travel_planner_backup_${new Date().toISOString().split('T')[0]}.json`, json, 'application/json');
  };

  const handleExportMarkdown = (trip: Trip) => {
      const md = exportTripToMarkdown(trip);
      downloadFile(`${trip.title.replace(/\s+/g, '_')}.md`, md, 'text/markdown');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.version && Array.isArray(json.trips)) {
                  onImportData(json);
              } else {
                  alert("Invalid backup file format.");
              }
          } catch (err) {
              alert("Failed to parse JSON file.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-stone-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col transition-colors duration-300"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50">
          <h2 className="text-2xl font-black text-stone-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full transition-colors">
            <X size={20} className="text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 dark:border-stone-700 px-6">
            <button 
                onClick={() => setActiveTab('general')}
                className={`py-4 px-2 font-bold text-sm mr-6 border-b-2 transition-colors ${activeTab === 'general' ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white' : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}
            >
                General & Data
            </button>
            <button 
                onClick={() => setActiveTab('recycle')}
                className={`py-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'recycle' ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white' : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}
            >
                Recycle Bin
                {deletedTrips.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{deletedTrips.length}</span>
                )}
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50 dark:bg-stone-900 transition-colors">
            {activeTab === 'general' ? (
                <div className="space-y-6">
                    {/* Appearance */}
                    <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                        <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-wider">Appearance</h3>
                        <div className="flex gap-4">
                            {['light', 'dark', 'system'].map((t) => (
                                <div 
                                    key={t}
                                    onClick={() => onThemeChange(t as any)}
                                    className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                                        theme === t 
                                        ? 'border-stone-900 dark:border-white bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white' 
                                        : 'border-transparent bg-white dark:bg-stone-800 text-stone-400 hover:border-stone-200 dark:hover:border-stone-600'
                                    }`}
                                >
                                    {t === 'light' ? <Sun size={20}/> : t === 'dark' ? <Moon size={20}/> : <Monitor size={20}/>}
                                    <span className="text-xs font-bold capitalize">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                        <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-wider">Data Sync</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {/* Export */}
                            <button 
                                onClick={handleExportBackup}
                                className="flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors border border-stone-100 dark:border-stone-600"
                            >
                                <Download size={24} className="text-stone-700 dark:text-stone-200 mb-2"/>
                                <span className="font-bold text-stone-800 dark:text-white text-sm">Export Backup</span>
                                <span className="text-[10px] text-stone-400">JSON Format</span>
                            </button>

                            {/* Import */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-stone-700 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors border border-stone-100 dark:border-stone-600"
                            >
                                <Upload size={24} className="text-stone-700 dark:text-stone-200 mb-2"/>
                                <span className="font-bold text-stone-800 dark:text-white text-sm">Import Backup</span>
                                <span className="text-[10px] text-stone-400">Restore Data</span>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileImport} 
                                className="hidden" 
                                accept=".json" 
                            />
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-stone-700">
                             <p className="text-xs text-stone-400 mb-2 mt-2">Export Trip to Markdown:</p>
                             <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {activeTrips.map(trip => (
                                    <button 
                                        key={trip.id}
                                        onClick={() => handleExportMarkdown(trip)}
                                        className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 text-left transition-colors"
                                    >
                                        <FileText size={14} className="text-stone-400" />
                                        <span className="text-sm font-medium text-stone-600 dark:text-stone-300 truncate">{trip.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 opacity-90">
                        <h3 className="text-xs font-bold uppercase text-red-400 mb-4 tracking-wider flex items-center gap-2">
                            <AlertTriangle size={14} /> Danger Zone
                        </h3>
                        <div className="space-y-3">
                             <button 
                                onClick={() => { if(confirm('Reset all data to default demo state?')) onResetToDemo() }}
                                className="w-full py-3 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-sm rounded-xl border border-red-100 dark:border-red-900/30 hover:border-red-300 hover:text-red-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={16} /> Reset to Demo Data
                            </button>
                            <button 
                                onClick={() => { if(confirm('Wait! This will WIPE EVERYTHING. Are you sure?')) onClearAllData() }}
                                className="w-full py-3 bg-white dark:bg-stone-800 text-red-600 font-bold text-sm rounded-xl border border-red-100 dark:border-red-900/30 hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Delete All Data
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // Recycle Bin Content
                <div className="space-y-4">
                    {deletedTrips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-stone-300 dark:text-stone-600">
                            <Trash2 size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">Recycle bin is empty</p>
                        </div>
                    ) : (
                        deletedTrips.map(trip => (
                            <div key={trip.id} className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${trip.vibeColor} flex items-center justify-center text-stone-900 font-bold opacity-50`}>
                                        {trip.title.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 dark:text-stone-200 line-through decoration-stone-400 text-stone-400">{trip.title}</h4>
                                        <p className="text-xs text-stone-400">{trip.dates}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onRestoreTrip(trip.id)}
                                        className="p-2 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                                        title="Restore"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>
                                    <button 
                                        onClick={() => { if(confirm('Delete forever?')) onPermanentDelete(trip.id) }}
                                        className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        title="Delete Forever"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

// --- Activity Modal ---

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
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);
  const [category, setCategory] = useState<Category>('spot');
  const [cost, setCost] = useState<string>(''); // Cost State

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setLocation(initialData?.location || '');
      setCategory(initialData?.category || 'spot');
      setCost(initialData?.cost ? String(initialData.cost) : ''); // Load Cost

      if (initialData?.time_range) {
        const [start, end] = initialData.time_range.split('-').map(s => s.trim());
        if (start) setStartTime(start);
        if (end) setEndTime(end);
      } else {
         setStartTime('09:00');
         setEndTime('10:00');
      }

      const foundColor = THEME_COLORS.find(c => c.bg === initialData?.vibe_color);
      if (foundColor) setSelectedColor(foundColor);
      else if (!initialData?.vibe_color) setSelectedColor(THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)]);
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
      cost: cost ? parseFloat(cost) : 0, // Save Cost
    });
    onClose();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div className={`h-4 w-full ${selectedColor.bg}`} />
      <div className="p-8 max-h-[85vh] overflow-y-auto no-scrollbar">
        <h2 className="text-2xl font-black text-stone-800 dark:text-white mb-6">
          {mode === 'create' ? 'Add Activity' : 'Edit Details'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Activity Name</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Visit Museum"
              className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-lg font-bold text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Location</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. City Center"
                    className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl pl-11 pr-4 py-3 text-stone-800 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white"
                    />
                </div>
            </div>
            
            <div className="col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Cost ($)</label>
                <input
                    type="number"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0"
                    className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-stone-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white text-center"
                />
            </div>
          </div>

           <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 transition-all ${isSelected ? 'border-stone-900 dark:border-white bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-white' : 'border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-400 hover:border-stone-200 dark:hover:border-stone-600'}`}
                    >
                        <Icon size={20} />
                        <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                    </button>
                  );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-stone-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-2xl px-4 py-3 text-stone-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Palette size={14} /> Color Theme
            </label>
            <div className="grid grid-cols-5 gap-3">
              {THEME_COLORS.map((color) => (
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
            {mode === 'create' ? 'Add Activity' : 'Save Changes'}
          </button>
          
          {mode === 'edit' && onDelete && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                }}
                className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 font-bold py-3 rounded-2xl mt-2 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all flex items-center justify-center gap-2"
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
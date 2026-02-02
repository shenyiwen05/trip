import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, RefreshCw, Moon, Sun, Monitor, AlertTriangle, FileText } from 'lucide-react';
import { Trip } from '../../types';
import { exportTripToMarkdown, exportTripsToJson, downloadFile } from '../../utils/exportUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTrips: Trip[]; // 包含所有行程（含已删除）
  onRestoreTrip: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onClearAllData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, allTrips, onRestoreTrip, onPermanentDelete, onClearAllData 
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'recycle'>('general');

  if (!isOpen) return null;

  // 筛选数据
  const deletedTrips = allTrips.filter(t => t.deleted);
  const activeTrips = allTrips.filter(t => !t.deleted);

  const handleExportBackup = () => {
      const json = exportTripsToJson(activeTrips);
      downloadFile(`vibe_backup_${new Date().toISOString().split('T')[0]}.json`, json, 'application/json');
  };

  const handleExportMarkdown = (trip: Trip) => {
      const md = exportTripToMarkdown(trip);
      downloadFile(`${trip.title.replace(/\s+/g, '_')}.md`, md, 'text/markdown');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h2 className="text-2xl font-black text-stone-900">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-6">
            <button 
                onClick={() => setActiveTab('general')}
                className={`py-4 px-2 font-bold text-sm mr-6 border-b-2 transition-colors ${activeTab === 'general' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
                General & Data
            </button>
            <button 
                onClick={() => setActiveTab('recycle')}
                className={`py-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'recycle' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
                Recycle Bin
                {deletedTrips.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{deletedTrips.length}</span>
                )}
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
            {activeTab === 'general' ? (
                <div className="space-y-6">
                    {/* Appearance (Mockup for UI complexity) */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-wider">Appearance</h3>
                        <div className="flex gap-4">
                            <div className="flex-1 p-3 rounded-xl border-2 border-stone-900 bg-stone-50 flex flex-col items-center gap-2 cursor-pointer">
                                <Sun size={20} />
                                <span className="text-xs font-bold">Light</span>
                            </div>
                            <div className="flex-1 p-3 rounded-xl border-2 border-transparent bg-white hover:border-stone-200 flex flex-col items-center gap-2 cursor-pointer opacity-50">
                                <Moon size={20} />
                                <span className="text-xs font-bold">Dark</span>
                            </div>
                            <div className="flex-1 p-3 rounded-xl border-2 border-transparent bg-white hover:border-stone-200 flex flex-col items-center gap-2 cursor-pointer opacity-50">
                                <Monitor size={20} />
                                <span className="text-xs font-bold">System</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                        <h3 className="text-xs font-bold uppercase text-stone-400 mb-4 tracking-wider">Data Management</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={handleExportBackup}
                                className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-stone-200 p-2 rounded-lg text-stone-700 group-hover:bg-white transition-colors"><Download size={18}/></div>
                                    <div className="text-left">
                                        <div className="font-bold text-stone-800">Backup All Data</div>
                                        <div className="text-xs text-stone-400">Export JSON file</div>
                                    </div>
                                </div>
                            </button>

                            <div className="pt-2 border-t border-stone-100">
                                <p className="text-xs text-stone-400 mb-2">Export specific trip to Markdown:</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {activeTrips.map(trip => (
                                        <button 
                                            key={trip.id}
                                            onClick={() => handleExportMarkdown(trip)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 text-left transition-colors"
                                        >
                                            <FileText size={14} className="text-stone-400" />
                                            <span className="text-sm font-medium text-stone-600 truncate">{trip.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100 opacity-80 hover:opacity-100 transition-opacity">
                        <h3 className="text-xs font-bold uppercase text-red-400 mb-4 tracking-wider flex items-center gap-2">
                            <AlertTriangle size={14} /> Danger Zone
                        </h3>
                        <button 
                            onClick={() => { if(confirm('This will wipe all data locally. Are you sure?')) onClearAllData() }}
                            className="w-full py-3 bg-white text-red-600 font-bold text-sm rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            Reset Application Data
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {deletedTrips.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-stone-300">
                            <Trash2 size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">Recycle bin is empty</p>
                        </div>
                    ) : (
                        deletedTrips.map(trip => (
                            <div key={trip.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${trip.vibeColor} flex items-center justify-center text-stone-900 font-bold opacity-50`}>
                                        {trip.title.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800 line-through decoration-stone-400 text-stone-400">{trip.title}</h4>
                                        <p className="text-xs text-stone-400">{trip.dates}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onRestoreTrip(trip.id)}
                                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                        title="Restore"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button 
                                        onClick={() => { if(confirm('Delete forever?')) onPermanentDelete(trip.id) }}
                                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

export default SettingsModal;
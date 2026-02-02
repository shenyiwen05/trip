import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Plus, Trash2, X, Briefcase } from 'lucide-react';
import { Trip, PackingItem } from '../../types';

interface PackingListProps {
  trip: Trip;
  onUpdateTrip: (trip: Trip) => void;
  onClose: () => void;
}

const CATEGORIES = ['essentials', 'clothing', 'electronics', 'toiletries', 'other'] as const;

const PackingList: React.FC<PackingListProps> = ({ trip, onUpdateTrip, onClose }) => {
  const [newItemText, setNewItemText] = useState('');
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('essentials');

  // 1. 初始化清单 (如果为空)
  const list = trip.packingList || [];

  // 2. 统计进度算法
  const totalItems = list.length;
  const checkedItems = list.filter(i => i.isChecked).length;
  const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  // --- Actions ---

  const handleToggle = (itemId: string) => {
    const newList = list.map(item => 
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );
    onUpdateTrip({ ...trip, packingList: newList });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: PackingItem = {
      id: `pack_${Date.now()}`,
      text: newItemText,
      isChecked: false,
      category: activeCategory
    };

    onUpdateTrip({ ...trip, packingList: [...list, newItem] });
    setNewItemText('');
  };

  const handleDeleteItem = (itemId: string) => {
    const newList = list.filter(item => item.id !== itemId);
    onUpdateTrip({ ...trip, packingList: newList });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        // 修改 1: max-w-md -> max-w-2xl (变宽)，并适配深色背景
        className="bg-white dark:bg-stone-800 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors duration-300"
      >
        {/* Header */}
        <div className="bg-stone-900 dark:bg-black text-white p-6 pb-8 relative overflow-hidden shrink-0">
           <div className="relative z-10 flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-black flex items-center gap-2 text-white">
                    <Briefcase className="text-yellow-400" /> Packing List
                </h2>
                <p className="text-stone-400 text-sm mt-1 font-medium">Don't forget the essentials!</p>
             </div>
             <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white">
                <X size={20} />
             </button>
           </div>
           
           {/* Progress Bar */}
           <div className="mt-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 opacity-80 text-white">
                  <span>Progress</span>
                  <span>{progress}%</span>
              </div>
              <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" 
                  />
              </div>
           </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto p-4 gap-2 border-b border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 no-scrollbar shrink-0">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    // 修改 2: 适配 Tab 的深色模式
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        activeCategory === cat 
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' 
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-stone-50 dark:bg-stone-900 transition-colors">
            {list.filter(i => i.category === activeCategory).length === 0 && (
                <div className="text-center py-10 text-stone-300 dark:text-stone-600 italic">
                    No items in {activeCategory} yet.
                </div>
            )}
            
            <AnimatePresence initial={false} mode="popLayout">
                {list.filter(i => i.category === activeCategory).map(item => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        // 修改 3: 适配列表项深色模式
                        className={`group flex items-center gap-3 p-4 rounded-xl border transition-all ${
                            item.isChecked 
                            ? 'bg-stone-100 dark:bg-stone-800/50 border-transparent opacity-60' 
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm'
                        }`}
                    >
                        <button onClick={() => handleToggle(item.id)} className="shrink-0 text-stone-900 dark:text-stone-200">
                            {item.isChecked ? <CheckSquare size={22} className="text-green-500" /> : <Square size={22} className="text-stone-300 dark:text-stone-600" />}
                        </button>
                        
                        <span className={`flex-1 font-medium text-stone-800 dark:text-stone-200 ${item.isChecked ? 'line-through decoration-2 decoration-stone-300 dark:decoration-stone-600' : ''}`}>
                            {item.text}
                        </span>

                        <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* Input Area */}
        <form onSubmit={handleAddItem} className="p-4 bg-white dark:bg-stone-800 border-t border-stone-100 dark:border-stone-700 flex gap-2 shrink-0">
            <input 
                type="text" 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder={`Add to ${activeCategory}...`}
                // 修改 4: 适配输入框深色模式
                className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-xl px-4 py-3 font-medium text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-500"
            />
            <button 
                type="submit"
                disabled={!newItemText.trim()}
                className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
            >
                <Plus size={24} />
            </button>
        </form>

      </motion.div>
    </div>
  );
};

export default PackingList;

import React, { useRef, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowLeft, Clock, Tag, Camera, ChevronUp, ChevronDown, Settings, MapPin } from 'lucide-react';
import { Activity } from '../types';
import NoteCanvas from './NoteCanvas';

interface DetailViewProps {
  activity: Activity;
  onClose: () => void;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onEditInfo: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ activity, onClose, onUpdateActivity, onEditInfo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const hasContent = (activity.blocks && activity.blocks.length > 0) || (activity.user_note && activity.user_note.length > 0);

  // Auto-resize Title textarea
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = titleTextareaRef.current.scrollHeight + 'px';
    }
  }, [activity.title]);

  const handleMainImageUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onUpdateActivity(activity.id, { image_url: url });
    }
  };

  // Animation variants
  const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40"
      />
      
      {/* Main Container */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center pointer-events-none">
        <motion.div
          layoutId={`card-${activity.id}`}
          className={`w-full h-full sm:h-[90vh] sm:w-[95vw] sm:max-w-5xl ${activity.vibe_color} sm:rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto relative`}
        >
          {/* Top Half: Header & Info (Fixed Background) */}
          <div className="absolute inset-0 pb-[40vh] p-6 sm:p-10 flex flex-col z-0">
            {/* Header Controls */}
            <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start">
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="w-12 h-12 flex items-center justify-center bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full text-black/70 transition-colors border border-white/10"
                >
                  <ArrowLeft size={24} />
                </motion.button>
                
                {/* Edit Settings Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 } }}
                  exit={{ opacity: 0 }}
                  onClick={onEditInfo}
                  className="w-12 h-12 flex items-center justify-center bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full text-black/70 transition-colors border border-white/10"
                >
                  <Settings size={22} />
                </motion.button>
            </div>


            {/* Main Content Grid */}
            <div className="flex-1 flex flex-col md:flex-row items-center md:items-start justify-center gap-8 mt-12 sm:mt-0">
              
              {/* Left: Square Image (Editable) */}
              <motion.div 
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-xs md:max-w-sm aspect-square relative shrink-0 group cursor-pointer"
                onClick={() => mainImageInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-black/10 rounded-[2rem] translate-y-4 translate-x-4" />
                <img 
                  src={activity.image_url} 
                  alt={activity.title}
                  className="w-full h-full object-cover rounded-[2rem] shadow-lg rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500"
                />
                
                {/* Image Edit Overlay */}
                <div className="absolute inset-0 rounded-[2rem] bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white/20 p-3 rounded-full text-white backdrop-blur-md">
                    <Camera size={32} />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={mainImageInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleMainImageUpdate}
                />
              </motion.div>

              {/* Right: Info (Editable) */}
              <motion.div 
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center md:items-start text-center md:text-left pt-4 md:pt-12 w-full md:w-auto"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 ${activity.text_color} opacity-70 mb-4 text-xs font-bold tracking-widest uppercase`}>
                   <Tag size={12} />
                   {activity.category}
                </div>
                
                {/* Editable Title */}
                <textarea
                  ref={titleTextareaRef}
                  value={activity.title}
                  onChange={(e) => onUpdateActivity(activity.id, { title: e.target.value })}
                  rows={1}
                  placeholder="Activity Title"
                  className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden text-center md:text-left ${activity.text_color} text-4xl md:text-6xl font-black mb-2 leading-[0.9] tracking-tight placeholder-black/20`}
                />

                {/* Location Display */}
                {activity.location && (
                    <div className={`flex items-center gap-1.5 ${activity.text_color} opacity-70 mb-4 justify-center md:justify-start w-full`}>
                        <MapPin size={16} className="shrink-0" />
                        <span className="text-lg font-medium truncate">{activity.location}</span>
                    </div>
                )}
                
                {/* Time Display (Read-only here, edit in Modal) */}
                <div className={`flex items-center gap-2 ${activity.text_color} opacity-80 text-xl font-medium justify-center md:justify-start w-full`}>
                  <Clock size={24} className="shrink-0" />
                  <span className="opacity-90">{activity.time_range}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Half: Digital Canvas (Note Area) */}
          <motion.div
            animate={{ top: isExpanded ? "5%" : "45%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm rounded-t-[2.5rem] z-30 flex flex-col p-6 sm:px-12 sm:pt-10 sm:pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            {/* Dynamic Glow Halo */}
            <div 
               className={`absolute inset-x-8 -top-8 h-20 rounded-t-[3rem] ${activity.vibe_color} blur-2xl transition-opacity duration-700 ease-in-out -z-10 ${hasContent ? 'opacity-80' : 'opacity-0'}`} 
            />

            {/* Handle Bar (Click Trigger) */}
            <div 
              className="w-full flex justify-center pb-6 cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex flex-col items-center gap-1">
                 <div className="w-16 h-1.5 bg-stone-200 rounded-full" />
                 {isExpanded ? (
                   <ChevronDown size={16} className="text-stone-300" />
                 ) : (
                   <ChevronUp size={16} className="text-stone-300" />
                 )}
              </div>
            </div>
            
            {/* Scrollable Canvas Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              
               <div className="flex items-center gap-3 mb-6 opacity-60">
                 <div className="h-px bg-stone-200 flex-1" />
                 <span className="text-stone-400 text-xs font-bold uppercase tracking-widest font-sans">
                    Vibe Canvas
                 </span>
                 <div className="h-px bg-stone-200 flex-1" />
               </div>
              
              {/* Description (Static) */}
              {activity.description && (
                 <p className="text-stone-400 mb-8 leading-relaxed font-serif italic text-lg text-center opacity-80">
                   "{activity.description}"
                 </p>
              )}

              {/* The New Digital Canvas */}
              <NoteCanvas 
                blocks={activity.blocks || []} 
                onChange={(newBlocks) => onUpdateActivity(activity.id, { blocks: newBlocks })} 
              />
              
            </div>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
};

export default DetailView;

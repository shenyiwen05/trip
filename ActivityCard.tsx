import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from '../types';
import { ArrowRight, Utensils, MapPin, Car, Camera, Coffee, Minus } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onClick: (id: string) => void;
  onDelete?: () => void;
  isEditMode: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick, onDelete, isEditMode }) => {
  
  const getIcon = (category: string) => {
    switch (category) {
      case 'food': return <Utensils size={14} />;
      case 'transport': return <Car size={14} />;
      case 'spot': return <Camera size={14} />;
      case 'chill': return <Coffee size={14} />;
      default: return <Camera size={14} />;
    }
  };

  const handleCardClick = () => {
    if (isEditMode) return; 
    onClick(activity.id);
  };

  return (
    <div className="relative w-full h-28 sm:h-24 mb-4 select-none group">
      {/* Card Surface */}
      <motion.div
        layoutId={`card-${activity.id}`}
        onClick={handleCardClick}
        animate={isEditMode ? { scale: 0.98 } : { scale: 1 }}
        className={`relative w-full h-full ${activity.vibe_color} rounded-3xl flex items-center px-6 sm:px-8 shadow-sm hover:shadow-md transition-all z-10 ${isEditMode ? 'cursor-default opacity-90' : 'cursor-pointer active:scale-[0.99]'}`}
      >
        {/* Grid Layout for Content */}
        <div className={`flex items-center w-full gap-6 ${isEditMode ? 'opacity-50 blur-[0.5px]' : 'opacity-100'} transition-all duration-300`}>
          
          {/* Left: Time */}
          <div className="flex flex-col items-start justify-center min-w-[4.5rem] border-r border-black/5 pr-4">
             <span className={`text-sm font-semibold tracking-wide ${activity.text_color} opacity-70`}>
              {activity.time_range.split('-')[0].trim()}
            </span>
            <span className={`text-sm font-semibold tracking-wide ${activity.text_color} opacity-40`}>
              {activity.time_range.split('-')[1]?.trim() || ''}
            </span>
          </div>

          {/* Center: Info */}
          <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
            <div className={`flex items-center gap-2 ${activity.text_color} opacity-60 text-xs font-bold uppercase tracking-wider`}>
              {getIcon(activity.category)}
              <span>{activity.category}</span>
            </div>
            <h3 className={`text-lg sm:text-xl font-bold leading-tight ${activity.text_color} truncate`}>
              {activity.title}
            </h3>
            {activity.location && (
              <div className={`flex items-center gap-1 ${activity.text_color} opacity-70 text-xs truncate`}>
                 <MapPin size={10} />
                 <span>{activity.location}</span>
              </div>
            )}
          </div>

          {/* Right: Arrow (Hidden in Edit Mode) */}
          {!isEditMode && (
              <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md ${activity.text_color}`}>
                <ArrowRight size={20} />
              </div>
          )}
        </div>
      </motion.div>

      {/* Delete Button - Moved OUTSIDE the motion.div to ensure clicks are registered reliably */}
      {isEditMode && onDelete && (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
            }}
            className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 active:scale-90 z-50 border-4 border-white cursor-pointer transition-transform"
            aria-label="Delete activity"
        >
            <Minus size={20} strokeWidth={4} />
        </button>
      )}
    </div>
  );
};

export default ActivityCard;
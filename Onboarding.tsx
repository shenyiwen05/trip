import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Sparkles, Map, Layers, Download } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Welcome to Travel Planner",
    desc: "The aesthetic way to design your next journey. Minimalist, visual, and organized.",
    icon: <Sparkles size={48} className="text-yellow-400" />,
    color: "bg-stone-900 text-white"
  },
  {
    title: "Visual Itinerary",
    desc: "Plan your days with drag-and-drop cards. Add photos, notes, and vibe colors instantly.",
    icon: <Map size={48} className="text-rose-400" />,
    color: "bg-rose-100 text-rose-900"
  },
  {
    title: "Smart Analytics",
    desc: "Track your budget distribution and time allocation automatically as you plan.",
    icon: <Layers size={48} className="text-sky-400" />,
    color: "bg-sky-100 text-sky-900"
  },
  {
    title: "Data Freedom",
    desc: "Your data stays local. Export to JSON for backup or Markdown for sharing anytime.",
    icon: <Download size={48} className="text-emerald-400" />,
    color: "bg-emerald-100 text-emerald-900"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6">
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: -20 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        {/* Visual Header */}
        <div className={`h-48 flex items-center justify-center ${STEPS[step].color} transition-colors duration-500`}>
           <motion.div 
             initial={{ scale: 0, rotate: -45 }}
             animate={{ scale: 1, rotate: 0 }}
             transition={{ delay: 0.2 }}
           >
             {STEPS[step].icon}
           </motion.div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
            <h2 className="text-2xl font-black text-stone-900 mb-3">{STEPS[step].title}</h2>
            <p className="text-stone-500 font-medium leading-relaxed mb-8 h-16">
                {STEPS[step].desc}
            </p>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-8">
                {STEPS.map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-stone-900' : 'bg-stone-200'}`} 
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="w-full py-4 rounded-2xl bg-stone-900 text-white font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {step === STEPS.length - 1 ? (
                    <>Get Started <Check size={20} /></>
                ) : (
                    <>Next <ChevronRight size={20} /></>
                )}
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
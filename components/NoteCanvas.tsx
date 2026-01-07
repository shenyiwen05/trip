
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Image as ImageIcon, X, GripVertical } from 'lucide-react';
import { CanvasBlock } from '../types';

interface NoteCanvasProps {
  blocks: CanvasBlock[];
  onChange: (blocks: CanvasBlock[]) => void;
}

// Helper for auto-resizing textarea
const AutoResizeTextarea: React.FC<{
  content: string;
  onChange: (val: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}> = ({ content, onChange, placeholder, autoFocus }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-none outline-none resize-none overflow-hidden font-serif text-xl sm:text-2xl text-stone-800 leading-loose placeholder:text-stone-300 selection:bg-rose-100"
      rows={1}
    />
  );
};

const NoteCanvas: React.FC<NoteCanvasProps> = ({ blocks, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Actions ---

  const addTextBlock = () => {
    const newBlock: CanvasBlock = {
      id: `block_${Date.now()}`,
      type: 'text',
      content: ''
    };
    onChange([...blocks, newBlock]);
  };

  // Trigger file selection
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection change
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newBlock: CanvasBlock = {
        id: `block_${Date.now()}`,
        type: 'image',
        url: imageUrl
      };
      onChange([...blocks, newBlock]);
    }
    // Reset input value to allow selecting the same file again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const updateBlock = (id: string, updates: Partial<CanvasBlock>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
    onChange(newBlocks);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  return (
    <div className="relative flex flex-col min-h-[50vh] pb-24">
      
      {/* Canvas Area */}
      <div className="flex-1 space-y-6">
        <AnimatePresence initial={false}>
          {blocks.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="text-stone-300 font-serif italic text-2xl text-center pt-10"
             >
                Start your story...
             </motion.div>
          )}

          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className="group relative"
            >
              {block.type === 'text' ? (
                <div className="relative pl-2">
                   {/* Hover Indicator */}
                   <div className="absolute -left-4 top-2 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                      <GripVertical size={16} />
                   </div>
                   <AutoResizeTextarea 
                      content={block.content || ''} 
                      onChange={(val) => updateBlock(block.id, { content: val })}
                      placeholder="Type something..."
                      autoFocus={blocks.length > 0 && index === blocks.length - 1 && !block.content} // Focus if new
                   />
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={block.url} 
                    alt="Canvas block" 
                    className="w-full rounded-2xl shadow-sm hover:shadow-md transition-shadow select-none"
                  />
                  {/* Delete Image Button */}
                  <button 
                    onClick={() => removeBlock(block.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 hover:scale-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Toolbar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-stone-900/90 backdrop-blur-xl rounded-full px-2 py-2 flex items-center gap-2 shadow-2xl pointer-events-auto border border-white/10"
        >
          <button 
            onClick={addTextBlock}
            className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center text-stone-200 transition-colors"
            title="Add Text"
          >
            <Type size={20} />
          </button>
          
          <div className="w-px h-6 bg-white/10" />

          <button 
            onClick={handleImageButtonClick}
            className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center text-stone-200 transition-colors"
            title="Add Image"
          >
            <ImageIcon size={20} />
          </button>
        </motion.div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

    </div>
  );
};

export default NoteCanvas;

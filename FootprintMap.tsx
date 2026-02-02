import React from 'react';
import { motion } from 'framer-motion';

const FootprintMap: React.FC = () => {
  // 模拟一些随机坐标点，产生动态效果
  const dots = Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    top: `${20 + Math.random() * 60}%`,
    left: `${20 + Math.random() * 60}%`,
    delay: i * 0.5
  }));

  return (
    <div className="bg-stone-900 rounded-3xl p-6 text-white relative overflow-hidden h-full min-h-[300px]">
      {/* 标题 */}
      <div className="relative z-10">
        <h3 className="font-bold text-lg">Travel Footprint</h3>
        <p className="text-stone-400 text-xs uppercase tracking-wider">Real-time Tracker (Simulated)</p>
      </div>

      {/* 模拟地图背景 */}
      <div className="absolute inset-0 opacity-20">
         {/* 用 CSS Radial Gradient 模拟地形起伏 */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-500 via-stone-900 to-stone-950" />
         
         {/* 网格线 */}
         <div className="absolute inset-0" 
              style={{ 
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
              }} 
         />
      </div>

      {/* 动态打点 */}
      {dots.map((dot) => (
        <motion.div
            key={dot.id}
            className="absolute w-4 h-4"
            style={{ top: dot.top, left: dot.left }}
        >
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 2, 3], opacity: [0.8, 0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
                className="absolute inset-0 bg-rose-500 rounded-full"
            />
            <div className="absolute inset-0 bg-rose-400 rounded-full w-2 h-2 m-auto shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
        </motion.div>
      ))}
      
      {/* 装饰性连接线 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <path d="M 50 150 Q 150 50 250 150 T 450 150" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
      </svg>
    </div>
  );
};

export default FootprintMap;
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trip } from '../../types';

interface TimeDistributionProps {
  trip: Trip;
}

const TimeDistribution: React.FC<TimeDistributionProps> = ({ trip }) => {
  
  // 辅助函数：计算两个时间点之间的分钟数
  const getDurationInHours = (timeRange: string) => {
    try {
      const [start, end] = timeRange.split('-').map(t => t.trim());
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      
      // 处理跨夜情况（简单处理）
      let diff = endMin - startMin;
      if (diff < 0) diff += 24 * 60;
      
      return parseFloat((diff / 60).toFixed(1));
    } catch (e) {
      return 1; // 默认1小时
    }
  };

  const data = trip.itinerary.map((day, index) => {
    const totalHours = day.activities.reduce((acc, act) => {
      return acc + getDurationInHours(act.time_range);
    }, 0);

    return {
      name: `Day ${index + 1}`,
      hours: totalHours,
      date: day.date
    };
  });

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 h-full flex flex-col">
      <h3 className="text-stone-800 font-bold text-lg mb-2">Activity Intensity</h3>
      <p className="text-stone-400 text-xs mb-6 uppercase tracking-wider">Hours per day</p>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a8a29e', fontSize: 12 }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#a8a29e', fontSize: 12 }} 
            />
            <Tooltip 
                cursor={{ fill: '#f5f5f4' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="hours" fill="#1c1917" radius={[6, 6, 6, 6]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeDistribution;
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Trip } from '../../types';

interface BudgetChartProps {
  trip: Trip;
}

const COLORS = ['#fca5a5', '#93c5fd', '#86efac', '#c4b5fd']; 

const BudgetChart: React.FC<BudgetChartProps> = ({ trip }) => {
  // 1. 数据处理算法：不再使用模拟数据，而是使用真实录入的 cost
  const calculateData = () => {
    const distribution: Record<string, number> = { food: 0, spot: 0, transport: 0, chill: 0 };
    
    trip.itinerary.forEach(day => {
      day.activities.forEach(act => {
        // 如果用户没填，默认为 0
        const cost = act.cost || 0;
        // 累加到对应类别
        if (distribution[act.category] !== undefined) {
             distribution[act.category] += cost;
        } else {
             // 防止未知类别
             distribution['chill'] += cost;
        }
      });
    });

    return Object.keys(distribution).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: distribution[key]
    })).filter(item => item.value > 0);
  };

  const data = calculateData();
  const totalBudget = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 h-full flex flex-col">
      <h3 className="text-stone-800 font-bold text-lg mb-2">Trip Budget</h3>
      <p className="text-stone-400 text-xs mb-6 uppercase tracking-wider">Total: ${totalBudget}</p>
      
      <div className="flex-1 w-full min-h-[250px]">
        {totalBudget > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`$${value}`, 'Cost']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
            </ResponsiveContainer>
        ) : (
            // 空状态处理
            <div className="h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                    <span className="text-2xl">$</span>
                </div>
                <p className="text-sm font-medium">No expenses recorded</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BudgetChart;
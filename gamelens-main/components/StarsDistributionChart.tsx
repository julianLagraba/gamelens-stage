// components/StarsDistributionChart.tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FeaturedGame } from '@/types';
import { Star } from 'lucide-react';

interface StarsDistributionChartProps {
  rating: FeaturedGame['rating'];
}

const COLORS = ['#10B981', '#3B82F6', '#FBBF24', '#EF4444', '#6B7280']; 

interface ChartDataItem {
    name: string;
    value: number;
    color: string;
    [key: string]: unknown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: ChartDataItem;
  }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-neutral-700/90 backdrop-blur-sm border border-neutral-600 rounded-lg shadow-xl text-white">
        <p className="font-bold text-lg">{data.name}</p>
        <p className="text-sm text-gray-300">{`${data.value.toLocaleString()} votos`}</p>
      </div>
    );
  }
  return null;
};

// ✅ EXPORTACIÓN CORRECTA: Se llama StarsDistributionChart
export const StarsDistributionChart: React.FC<StarsDistributionChartProps> = ({ rating }) => {
  
  const chartData: ChartDataItem[] = [
    { name: '5 Estrellas', value: rating['5'] as number, color: COLORS[0] },
    { name: '4 Estrellas', value: rating['4'] as number, color: COLORS[1] },
    { name: '3 Estrellas', value: rating['3'] as number, color: COLORS[2] },
    { name: '2 Estrellas', value: rating['2'] as number, color: COLORS[3] },
    { name: '1 Estrella', value: rating['1'] as number, color: COLORS[4] },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-2xl transition-all hover:border-blue-500/50">
      <h3 className="text-xl font-semibold mb-6 text-white flex items-center gap-3 border-b border-neutral-800/50 pb-3">
        <Star size={22} className="text-yellow-400 fill-yellow-400" /> Distribución de Puntuaciones
      </h3>
      
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#171717" strokeWidth={1} /> 
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 text-sm mt-6">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center text-gray-300 font-medium hover:text-white transition duration-200 cursor-default">
            <span className="w-3 h-3 rounded-full mr-2 shadow-md" style={{ backgroundColor: item.color }}></span>
            {item.name}
            <span className="ml-2 font-bold text-neutral-400">({item.value.toLocaleString()})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
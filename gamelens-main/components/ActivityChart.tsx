// components/ActivityChart.tsx

'use client'; // Necesario para usar React hooks con Recharts

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FeaturedGame } from '@/types';
import { TrendingUp } from 'lucide-react';

interface ActivityChartProps {
  data: FeaturedGame['activityByWeekday'];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  
  // Formateador simple para las leyendas del eje Y (ej: 120000 -> 120k)
  const formatYAxis = (tick: number) => `${(tick / 1000).toFixed(0)}k`;

  return (
    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-xl">
      <div className="flex items-center text-lg font-semibold mb-4 text-blue-400">
        <TrendingUp size={20} className="mr-2" />
        Actividad Promedio por Día de la Semana
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="weekday" stroke="#777" />
            <YAxis 
              stroke="#777" 
              tickFormatter={formatYAxis} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1C1C1C', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value: number) => [`${(value).toLocaleString()} jugadores`, 'Promedio']}
            />
            <Bar 
              dataKey="avgPlayers" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
              name="Jugadores Promedio"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
// components/PlayerGrowthChart.tsx
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GameDetail } from '@/types';
import { TrendingUp } from 'lucide-react';

interface PlayerGrowthChartProps {
  data: GameDetail['playerGrowth14d'];
}

// FIX: Definimos la interfaz para los props del Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      day: string;
      players: number;
    };
  }>;
  label?: string;
}

// FIX: Usamos la interfaz en lugar de 'any'
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-neutral-700/90 backdrop-blur-sm border border-neutral-600 rounded-lg shadow-xl text-white">
        <p className="font-bold text-lg">{label}</p>
        <p className="text-sm text-green-300">{`${payload[0].value.toLocaleString()} jugadores`}</p>
      </div>
    );
  }
  return null;
};

export const PlayerGrowthChart: React.FC<PlayerGrowthChartProps> = ({ data }) => {
  // Formateador Y (180000 -> 180k)
  const formatYAxis = (tick: number) => `${(tick / 1000).toFixed(0)}k`;
  
  // Formateador X (Fecha "2025-11-15" -> "15 Nov")
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm h-full">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <TrendingUp className="text-purple-500" /> Crecimiento de Jugadores (14 días)
      </h2>
      
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="#777" 
              tick={{ fontSize: 10 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              stroke="#777" 
              tickFormatter={formatYAxis} 
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="players" 
              stroke="#8B5CF6" 
              fillOpacity={1} 
              fill="url(#colorPlayers)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
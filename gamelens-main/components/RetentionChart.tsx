// components/RetentionChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GameDetail } from '@/types';
import { Users } from 'lucide-react';

interface RetentionChartProps {
  data: GameDetail['retention'];
}

// FIX: Definimos la estructura de los datos transformados para el gráfico
interface RetentionDataPoint {
  name: string;
  key: string;
  value: number;
  color: string;
}

// FIX: Definimos la interfaz para los props del Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: RetentionDataPoint;
  }>;
  label?: string;
}

// ✅ CORRECCIÓN: Movimos el componente CustomTooltip FUERA del componente principal
// Esto evita que se vuelva a crear en cada renderizado (regla react-hooks/static-components)
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-neutral-700/90 backdrop-blur-sm border border-neutral-600 rounded-lg shadow-xl text-white">
        <p className="font-bold">{label}</p>
        <p className="text-sm">Retención: <span className="font-bold text-white">{payload[0].value}%</span></p>
      </div>
    );
  }
  return null;
};

export const RetentionChart: React.FC<RetentionChartProps> = ({ data }) => {
  // Transformar objeto { d1: 68, d2: 49... } a array para Recharts
  const chartData: RetentionDataPoint[] = [
    { name: 'Día 1', key: 'd1', value: data.d1, color: '#10B981' }, // Verde
    { name: 'Día 2', key: 'd2', value: data.d2, color: '#3B82F6' }, // Azul
    { name: 'Día 3', key: 'd3', value: data.d3, color: '#F59E0B' }, // Naranja
  ];

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm h-full">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Users className="text-orange-400" /> Retención de Usuarios
      </h2>
      
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis dataKey="name" stroke="#777" tick={{ fill: '#fff' }} />
            <YAxis stroke="#777" unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
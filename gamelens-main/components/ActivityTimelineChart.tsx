'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// --- TIPOS ---
interface TimelineChartDataItem {
    hour: string;
    players: number;
    [key: string]: unknown;
}

interface CustomTimelineTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: TimelineChartDataItem;
    }>;
    label?: string | number;
}

interface ActiveDotProps {
    cx?: number;
    cy?: number;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [key: string]: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

interface ActivityTimelineChartProps {
    data: { hour: string; players: number }[];
}

// --- SUB-COMPONENTES INTERNOS ---

const CustomTooltip = ({ active, payload, label }: CustomTimelineTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-white">
                <p className="font-bold text-lg mb-1">Hora: {label}</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FD1372]" />
                    <p className="text-sm text-gray-200">{`${payload[0].value.toLocaleString()} jugadores`}</p>
                </div>
            </div>
        );
    }
    return null;
};

const CustomActiveDot = (props: ActiveDotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;

    return (
        <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#FD1372"
            stroke="#fff"
            strokeWidth={2}
        />
    );
};

// --- COMPONENTE PRINCIPAL ---

const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({ data }) => {
    const formatYAxis = (tick: number) => `${(tick / 1000).toFixed(0)}k`;

    return (
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm h-full flex flex-col w-full">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                <Clock size={16} className="text-[#2DD4E0]" /> Actividad 24h
            </h3>

            <div className="flex-1 w-full min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#2DD4E0" />
                                <stop offset="50%" stopColor="#C471F2" />
                                <stop offset="100%" stopColor="#4530BE" />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                        <XAxis
                            dataKey="hour"
                            stroke="#555"
                            // AQUI ESTÁN LOS CAMBIOS DE LEGIBILIDAD
                            tick={{ fontSize: 12, fill: '#A3A3A3', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />

                        <YAxis
                            stroke="#555"
                            tickFormatter={formatYAxis}
                            // AQUI ESTÁN LOS CAMBIOS DE LEGIBILIDAD
                            tick={{ fontSize: 12, fill: '#A3A3A3', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                        />

                        <Line
                            type="monotone"
                            dataKey="players"
                            stroke="url(#chartGradient)"
                            // AQUI ESTÁ EL CAMBIO DE GROSOR DE LÍNEA
                            strokeWidth={5}
                            dot={{ r: 0 }}
                            activeDot={CustomActiveDot}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityTimelineChart;
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PerformanceMetric } from '../../types';

interface PerformanceChartProps {
  data: PerformanceMetric[];
  showClassAverage?: boolean;
  studentLabel?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  showClassAverage = true,
  studentLabel = 'Student Score',
}) => {
  return (
    <div className="w-full h-[280px] sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B866" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#14B866" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e6f0eb" vertical={false} />

          <XAxis
            dataKey="period"
            stroke="#8da39c"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e1ede7' }}
          />

          <YAxis
            stroke="#8da39c"
            fontSize={12}
            domain={[60, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl border border-[#e1ede7] bg-white p-3 shadow-dropdown">
                    <p className="text-xs font-semibold text-[#142D27] mb-1.5">{label}</p>
                    <div className="space-y-1">
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs">
                          <span className="flex items-center gap-1.5 text-[#557067]">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:
                          </span>
                          <span className="font-bold text-[#142D27]">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          {showClassAverage && (
            <Area
              type="monotone"
              dataKey="classAverage"
              name="Cohort Average"
              stroke="#0EA5E9"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAvg)"
            />
          )}

          <Area
            type="monotone"
            dataKey="studentScore"
            name={studentLabel}
            stroke="#14B866"
            strokeWidth={2.5}
            activeDot={{ r: 6, fill: '#14B866', stroke: '#fff', strokeWidth: 2 }}
            fillOpacity={1}
            fill="url(#colorStudent)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Subject } from '../../types';

interface SubjectProgressChartProps {
  subjects: Subject[];
}

export const SubjectProgressChart: React.FC<SubjectProgressChartProps> = ({ subjects }) => {
  const chartData = subjects.map((sub) => ({
    name: sub.code,
    fullName: sub.name,
    progress: sub.progress,
    color: sub.accentColor,
    completed: sub.completedModules,
    total: sub.totalModules,
  }));

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barSize={28}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e6f0eb" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#8da39c"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#e1ede7' }}
          />
          <YAxis
            stroke="#8da39c"
            fontSize={12}
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-xl border border-[#e1ede7] bg-white p-3 shadow-dropdown">
                    <p className="text-xs font-semibold text-[#142D27]">{data.fullName}</p>
                    <p className="text-xs text-[#557067] mt-1">
                      Progress: <span className="font-bold text-[#14B866]">{data.progress}%</span>
                    </p>
                    <p className="text-[11px] text-[#7d9990] mt-0.5">
                      {data.completed} of {data.total} modules mastered
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

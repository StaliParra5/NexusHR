'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Employee } from '@/types';

interface WorkloadChartProps {
  employees: Employee[];
}

export default function WorkloadChart({ employees }: WorkloadChartProps) {
  // Aggregate data by department
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  
  const deptData: Record<string, { name: string; workload: number; count: number }> = {};

  activeEmployees.forEach(emp => {
    const dept = emp.department || 'Sin Dept';
    const load = Number(emp.workload) || 0;
    
    if (!deptData[dept]) {
      deptData[dept] = { name: dept, workload: 0, count: 0 };
    }
    deptData[dept].workload += load;
    deptData[dept].count += 1;
  });

  // Calculate average
  const data = Object.values(deptData).map(d => ({
    name: d.name,
    avgWorkload: Math.round(d.workload / d.count),
    headcount: d.count
  })).sort((a, b) => b.avgWorkload - a.avgWorkload);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Carga Promedio: <span className="font-semibold text-blue-600 dark:text-blue-400">{payload[0].value}%</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Personal: {payload[0].payload.headcount}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors h-[400px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Carga por Departamento</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                unit="%"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="avgWorkload" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avgWorkload > 85 ? '#ef4444' : entry.avgWorkload > 65 ? '#f97316' : '#3b82f6'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Employee } from '@/types';

interface DepartmentHeadcountChartProps {
  employees: Employee[];
}

export default function DepartmentHeadcountChart({ employees }: DepartmentHeadcountChartProps) {
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  
  const deptData: Record<string, number> = {};

  activeEmployees.forEach(emp => {
    const dept = emp.department || 'Sin Dept';
    deptData[dept] = (deptData[dept] || 0) + 1;
  });

  const data = Object.entries(deptData).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Total: <span className="font-semibold text-blue-600 dark:text-blue-400">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors h-[350px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Personal por Departamento</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis type="number" hide />
            <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                width={100}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
               {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#3b82f6" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

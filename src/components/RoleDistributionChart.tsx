'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Employee } from '@/types';

interface RoleDistributionChartProps {
  employees: Employee[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#8dd1e1', '#82ca9d', '#a4de6c'];

export default function RoleDistributionChart({ employees }: RoleDistributionChartProps) {
  const activeEmployees = employees.filter(e => e.status !== 'Inactive');
  
  const roleData: Record<string, number> = {};

  activeEmployees.forEach(emp => {
    const role = emp.role || 'Sin Rol';
    roleData[role] = (roleData[role] || 0) + 1;
  });

  const data = Object.entries(roleData).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 shadow-lg rounded-lg">
          <p className="font-bold text-slate-800 dark:text-white mb-1">{payload[0].name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Personal: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors h-[350px] flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Distribución por Roles</h3>
      <div className="flex-1 w-full min-h-0">
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconType="circle"
                wrapperStyle={{ 
                    fontSize: '12px', 
                    maxHeight: '240px', 
                    overflowY: 'auto', 
                    paddingRight: '10px' 
                }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

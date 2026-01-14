import { Users, Activity, Battery } from 'lucide-react';

interface StatsProps {
  totalEmployees: number;
  activeEmployees: number;
  averageWorkload: number;
}

export default function StatsCards({ totalEmployees, activeEmployees, averageWorkload }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Employees */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Total Empleados</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalEmployees}</h3>
        </div>
      </div>

      {/* Active Employees */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
          <Activity size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Activos Ahora</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeEmployees}</h3>
        </div>
      </div>

      {/* Average Workload */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center space-x-4 transition-colors">
        <div className={`p-3 rounded-lg ${averageWorkload > 85 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
          <Battery size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Carga Promedio</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{averageWorkload.toFixed(1)}%</h3>
        </div>
      </div>
    </div>
  );
}

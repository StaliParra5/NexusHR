"use client";

import { Employee } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeList({ employees }: { employees: Employee[] }) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const updateLoad = async (id: number, currentLoad: number, increment: number) => {
    setUpdatingId(id);
    const newLoad = Math.min(100, Math.max(0, currentLoad + increment));
    
    let newStatus = 'Active';
    if (newLoad > 90) newStatus = 'Warning';
    if (newLoad === 0) newStatus = 'Inactive';

    await supabase
      .from('employees')
      .update({ load: newLoad, status: newStatus })
      .eq('id', id);
    
    setUpdatingId(null);
  };

  const deleteEmployee = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    await supabase.from('employees').delete().eq('id', id);
  };

  if (employees.length === 0) {
    return <div className="p-8 text-center text-slate-500">No hay empleados registrados.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
          <tr>
            <th className="px-6 py-4">Empleado</th>
            <th className="px-6 py-4">Rol</th>
            <th className="px-6 py-4">Estado</th>
            <th className="px-6 py-4">Carga (CRUD)</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-6 py-4 font-medium text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {emp.name.charAt(0)}
                  </div>
                  {emp.name}
                </div>
              </td>
              <td className="px-6 py-4 text-slate-500">{emp.role}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                  emp.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                  'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {emp.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 max-w-[140px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{emp.load}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          emp.load > 90 ? 'bg-red-500' : emp.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${emp.load}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      disabled={updatingId === emp.id}
                      onClick={() => updateLoad(emp.id, emp.load, -10)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500" title="-10%"
                    >
                      <TrendingDown size={14} />
                    </button>
                    <button 
                      disabled={updatingId === emp.id}
                      onClick={() => updateLoad(emp.id, emp.load, 10)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500" title="+10%"
                    >
                      <TrendingUp size={14} />
                    </button>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => deleteEmployee(emp.id)}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
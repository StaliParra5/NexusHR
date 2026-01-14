'use client';

import { Employee } from '@/types';
import { Trash2, Plus, Minus, Pencil, PowerOff, FileDown, FileText } from 'lucide-react';
import { generateEmployeeCSV, generateEmployeePDF } from '@/lib/exportUtils';
import { supabase } from '@/lib/supabase';

import { toast } from 'sonner';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  showInactive?: boolean; // New prop to control visibility
  onUpdate?: () => void;
  onWorkloadChange?: (id: string, current: number, change: number) => void;
}

export default function EmployeeTable({ employees, onEdit, showInactive = false, onUpdate, onWorkloadChange }: EmployeeTableProps) {
  
  // Fallback if no optimistic update is provided (legacy support)
  const handleWorkloadChange = async (id: string, current: number, change: number) => {
      if (onWorkloadChange) {
          onWorkloadChange(id, current, change);
      } else {
           // ... old logic or just ignore
           console.warn("onWorkloadChange not provided");
      }
  };

  const disableEmployee = async (id: string) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 w-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">¿Deshabilitar empleado?</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">El empleado perderá acceso y dejará de contar en las métricas activas.</p>
        <div className="flex justify-end gap-2">
           <button 
             onClick={() => toast.dismiss(t)}
             className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
           >
             Cancelar
           </button>
           <button 
             onClick={async () => {
                toast.dismiss(t);
                const { error } = await supabase.from('employees').update({ status: 'Inactive' }).eq('id', id);
                if (error) {
                    toast.error('Error al deshabilitar');
                } else {
                    toast.success('Empleado deshabilitado correctamente');
                    if (onUpdate) onUpdate();
                }
             }}
             className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors font-medium"
           >
             Confirmar
           </button>
        </div>
      </div>
    ));
  };

  const enableEmployee = async (id: string) => {
      const { error } = await supabase.from('employees').update({ status: 'Active' }).eq('id', id);
      if (error) {
          toast.error('Error al habilitar empleado');
      } else {
          toast.success('Empleado habilitado nuevamente');
          if (onUpdate) onUpdate();
      }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Empleado</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Departamento</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Carga</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {employees.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                        No hay personal registrado.
                    </td>
                </tr>
            ) : (
                employees.map((employee) => {
                   const safeWorkload = Number(employee.workload) || 0;
                   return (
                    <tr key={employee.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${employee.status === 'Inactive' ? 'opacity-60 bg-gray-50 dark:bg-slate-800/20' : ''}`}>
                        <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-slate-200">{employee.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-sm">{employee.role || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-sm">{employee.department || 'N/A'}</td>
                        <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 w-24 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                safeWorkload > 90 ? 'bg-red-500' : 
                                safeWorkload > 70 ? 'bg-orange-400' : 'bg-green-500'
                                }`}
                                style={{ width: `${safeWorkload}%` }}
                            />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 w-8">{safeWorkload}%</span>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'Warning' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            employee.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                            {employee.status || 'Active'}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">


                            {employee.status !== 'Inactive' && (
                                <div className="flex justify-end gap-2 whitespace-nowrap">
                                    <button 
                                        onClick={() => handleWorkloadChange(employee.id, safeWorkload, -10)}
                                        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Reducir Carga"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleWorkloadChange(employee.id, safeWorkload, 10)}
                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                        title="Aumentar Carga"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button 
                                        onClick={() => generateEmployeePDF(employee)}
                                        className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                                        title="Descargar Ficha PDF"
                                    >
                                        <FileText size={16} />
                                    </button>
                                    <button 
                                        onClick={() => onEdit(employee)}
                                        className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => disableEmployee(employee.id)}
                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                        title="Deshabilitar"
                                    >
                                        <PowerOff size={16} />
                                    </button>
                                </div>
                            )}
                            {employee.status === 'Inactive' && (
                                <button 
                                    onClick={() => enableEmployee(employee.id)}
                                    className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors font-medium text-sm"
                                    title="Habilitar"
                                >
                                    Habilitar
                                </button>
                            )}
                        </td>
                    </tr>
                )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

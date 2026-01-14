'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/types';
import EmployeeTable from '@/components/EmployeeTable';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import { generateTeamExcel, generateTeamPDF } from '@/lib/exportUtils';
import { Activity, LayoutDashboard, Users, Settings, LogOut, Search, Filter, FileDown, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';

import { toast } from 'sonner';

const RoleDistributionChart = dynamic(() => import('@/components/RoleDistributionChart'), { 
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />,
  ssr: false 
});
const DepartmentHeadcountChart = dynamic(() => import('@/components/DepartmentHeadcountChart'), { 
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />,
  ssr: false 
});
const WorkloadChart = dynamic(() => import('@/components/WorkloadChart'), { 
  loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />,
  ssr: false 
});

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filter, setFilter] = useState('All'); // All, Active, Inactive
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const updateEmployeeWorkload = async (id: string, currentWorkload: number, change: number) => {
    // 1. Calculate new values
    const safeCurrent = Number(currentWorkload) || 0;
    const newWorkload = Math.min(100, Math.max(0, safeCurrent + change));
    
    let newStatus: Employee['status'] = 'Active';
    if (newWorkload > 90) newStatus = 'Warning';
    if (newWorkload === 0) newStatus = 'Inactive'; 

    // 2. Optimistic Update (Immediate UI Refresh)
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, workload: newWorkload, status: newStatus } : emp
    ));

    // 3. Persist to Backend
    const { error } = await supabase
      .from('employees')
      .update({ workload: newWorkload, status: newStatus })
      .eq('id', id);

    // 4. Rollback on Error
    if (error) {
      console.error("Error updating workload:", error);
      toast.error('Error al actualizar carga');
      fetchEmployees(); // Revert to server state
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('name', { ascending: true }).order('id', { ascending: true });
    setEmployees(data || []);
  };

  useEffect(() => {
    fetchEmployees();
     // Real-time subscription could be added here too ideally
  }, []);

  const handleEdit = (employee: Employee) => {
      setEditingEmployee(employee);
      setIsModalOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      // Status Filter
      if (filter === 'Active' && e.status === 'Inactive') return false;
      if (filter === 'Inactive' && e.status !== 'Inactive') return false;
      
      // Search Filter
      if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
              e.name.toLowerCase().includes(term) ||
              (e.role && e.role.toLowerCase().includes(term)) ||
              (e.department && e.department.toLowerCase().includes(term))
          );
      }
      return true;
    });
  }, [employees, filter, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Directorio de Equipo" />



        <div className="flex-1 overflow-auto p-8">
            <div className="w-full max-w-[1920px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <RoleDistributionChart employees={employees} />
                    <DepartmentHeadcountChart employees={employees} />
                    <WorkloadChart employees={employees} />
                </div>



                {/* Controls */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar empleado..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                title="Opciones de Exportación"
                            >
                                <FileDown size={18} /> Exportar <ChevronDown size={16} />
                            </button>
                            
                            {isExportMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button 
                                        onClick={() => {
                                            generateTeamPDF(filteredEmployees, `Reporte ${filter === 'All' ? 'General' : filter}`);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <FileText size={16} className="text-red-500" /> Reporte PDF (Diseño)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            generateTeamExcel(filteredEmployees, `Reporte_Gestion_${filter}`);
                                            setIsExportMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-slate-700"
                                    >
                                        <FileSpreadsheet size={16} className="text-green-600" /> Exportar Excel (.xlsx)
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {isExportMenuOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsExportMenuOpen(false)}></div>
                        )}

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <Filter size={18} className="text-slate-500 dark:text-slate-400" />
                        <select 
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">Todos</option>
                            <option value="Active">Activos</option>
                            <option value="Inactive">Inactivos</option>
                        </select>
                    </div>
                </div>

                <EmployeeTable 
                    employees={filteredEmployees}
                    onEdit={handleEdit}
                    showInactive={true}
                    onUpdate={fetchEmployees}
                    onWorkloadChange={updateEmployeeWorkload}
                />
            </div>
        </div>
      </main>

      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {setIsModalOpen(false); setEditingEmployee(null);}}
        onSuccess={fetchEmployees}
        employeeToEdit={editingEmployee}
      />
    </div>
  );
}

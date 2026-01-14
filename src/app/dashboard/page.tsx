'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/types';
import EmployeeTable from '@/components/EmployeeTable';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import StatsCards from '@/components/StatsCards';
import { Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import WorkloadChart from '@/components/WorkloadChart';

import { toast } from 'sonner';

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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

  // Computed Metrics
  const totalEmployees = employees.length;
  // Count 'Active' and 'Warning' as active employees
  const activeEmployeesCount = employees.filter(e => e.status !== 'Inactive').length;
  
  // Calculate average workload only for active employees
  const activeEmployeesList = employees.filter(e => e.status !== 'Inactive');
  const averageWorkload = activeEmployeesList.length > 0 
    ? activeEmployeesList.reduce((sum, e) => sum + (Number(e.workload) || 0), 0) / activeEmployeesList.length 
    : 0;

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false })
        .order('name', { ascending: true });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();

    // Real-time subscription
    const channel = supabase
      .channel('employees-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' }, 
        (payload) => {
          console.log('Real-time change:', payload);
          fetchEmployees(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEdit = (employee: Employee) => {
      setEditingEmployee(employee);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingEmployee(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Panel de Control" />

        <div className="flex-1 overflow-auto p-8">
          <div className="w-full max-w-[1920px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Page Title & Action */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Monitor de Recursos</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Gestión operativa en tiempo real</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={18} /> Nuevo Recurso
              </button>
            </div>
            
            {/* Stats */}
            <StatsCards 
              totalEmployees={totalEmployees}
              activeEmployees={activeEmployeesCount}
              averageWorkload={averageWorkload}
            />



            {/* Content Area - Charts and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section - Takes 1/3 on large screens */}
                <div className="lg:col-span-1">
                     <WorkloadChart employees={employees} />
                </div>

                {/* Table Section - Takes 2/3 on large screens */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Personal Activo</h3>
                  {isLoading ? (
                    <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-slate-400">Cargando datos...</span>
                      </div>
                    </div>
                  ) : (
                    <EmployeeTable 
                        employees={activeEmployeesList} 
                        onEdit={handleEdit}
                        onUpdate={fetchEmployees}
                        onWorkloadChange={updateEmployeeWorkload}
                    />
                  )}
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSuccess={fetchEmployees}
        employeeToEdit={editingEmployee}
      />
    </div>
  );
}
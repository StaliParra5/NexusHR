import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Employee } from '@/types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeToEdit?: Employee | null;
}

const ROLES = [
  'Frontend Dev', 'Backend Dev', 'Fullstack Dev', 'QA Tester', 'Project Manager', 
  'UI/UX Designer', 'DevOps', 'Data Analyst', 'Product Owner'
];

const DEPARTMENTS = ['Ingeniería', 'Diseño', 'Producto', 'Marketing', 'Ventas', 'RRHH'];

export default function AddEmployeeModal({ isOpen, onClose, onSuccess, employeeToEdit }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: ROLES[0],
    department: DEPARTMENTS[0],
    workload: 0,
    status: 'Active'
  });

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name,
        role: employeeToEdit.role || ROLES[0],
        department: employeeToEdit.department || DEPARTMENTS[0],
        workload: employeeToEdit.workload,
        status: employeeToEdit.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        role: ROLES[0],
        department: DEPARTMENTS[0],
        workload: 0,
        status: 'Active'
      });
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        let error;
        const status = formData.workload > 90 ? 'Warning' : 'Active';

        const dataToSave = {
            ...formData,
            status: employeeToEdit ? (employeeToEdit.status === 'Inactive' ? 'Inactive' : status) : status
        };
        
        const finalStatus = dataToSave.workload > 90 ? 'Warning' : 'Active';

        if (employeeToEdit) {
            const { error: updateError } = await supabase
                .from('employees')
                .update({ ...formData, status: finalStatus })
                .eq('id', employeeToEdit.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('employees')
                .insert([{ ...formData, status: finalStatus }]);
            error = insertError;
        }

      if (error) throw error;
      
      toast.success(employeeToEdit ? 'Empleado actualizado correctamente' : 'Nuevo empleado registrado');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving employee full:', JSON.stringify(error, null, 2));
      toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 z-10 border border-white/20 dark:border-slate-800 transition-colors">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {employeeToEdit ? 'Editar Personal' : 'Nuevo Personal'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rol</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                  {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Departamento</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                  {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Carga Inicial (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors"
              value={formData.workload}
              onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-4 disabled:opacity-50 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20"
          >
            {loading ? 'Guardando...' : (employeeToEdit ? 'Actualizar Personal' : 'Guardar Personal')}
          </button>
        </form>
      </div>
    </div>
  );
}

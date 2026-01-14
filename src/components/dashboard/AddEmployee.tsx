"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Loader2, X } from 'lucide-react';
import { NewEmployee } from '@/types';

export default function AddEmployee() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewEmployee>({
    name: '',
    role: 'Frontend Dev',
    status: 'Active',
    load: 50,
    tasks: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('employees')
        .insert([formData]);

      if (error) throw error;
      
      setIsOpen(false);
      setFormData({ name: '', role: 'Frontend Dev', status: 'Active', load: 50, tasks: 1 });
    } catch (error) {
      console.error('Error al crear:', error);
      alert('Error al crear empleado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-slate-200 transition-all"
      >
        <Plus className="w-4 h-4" /> Nuevo Empleado
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800">Registrar Recurso</h3>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej. Laura Martínez"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Rol</label>
              <select 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option>Frontend Dev</option>
                <option>Backend Dev</option>
                <option>UI Designer</option>
                <option>DevOps</option>
                <option>Product Owner</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Carga Inicial (%)</label>
              <input 
                type="number" 
                min="0" max="100"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={formData.load}
                onChange={e => setFormData({...formData, load: Number(e.target.value)})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex justify-center items-center gap-2 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Guardar Empleado"}
          </button>
        </form>
      </div>
    </div>
  );
}
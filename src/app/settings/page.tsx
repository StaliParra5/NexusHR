'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, LayoutDashboard, Users, Settings, LogOut, Bell, Shield, User, Database, Wrench } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function SettingsPage() {
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairStatus, setRepairStatus] = useState('');
  const [userEmail, setUserEmail] = useState('Cargando...');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setUserEmail(user.email || 'Invitado');
    });
  }, []);
  
  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
        setPasswordMsg('Error: Mínimo 6 caracteres.');
        return;
    }
    setPasswordLoading(true);
    setPasswordMsg('');
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setPasswordMsg('Contraseña actualizada correctamente.');
        setNewPassword('');
    } catch (err: any) {
        setPasswordMsg('Error: ' + err.message);
    } finally {
        setPasswordLoading(false);
    }
  };

  const handleRepairData = async () => {
    setIsRepairing(true);
    setRepairStatus('');
    try {
        const { data: employees, error } = await supabase.from('employees').select('*');
        if (error) throw error;

        let fixedCount = 0;
        
        if (employees) {
            for (const emp of employees) {
                let updates: any = {};
                let needsUpdate = false;

                if (emp.workload === null || isNaN(Number(emp.workload))) {
                    updates.workload = 0;
                    needsUpdate = true;
                }
                if (!emp.department) {
                    updates.department = 'General';
                    needsUpdate = true;
                }
                if (!emp.role) {
                    updates.role = 'Personal';
                    needsUpdate = true;
                }
                if (!emp.status) {
                    updates.status = 'Active';
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await supabase.from('employees').update(updates).eq('id', emp.id);
                    fixedCount++;
                }
            }
        }
        setRepairStatus(`Proceso completado. Se repararon ${fixedCount} registros.`);
    } catch (e) {
        console.error(e);
        setRepairStatus('Error al reparar los datos.');
    } finally {
        setIsRepairing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Configuración del Sistema" />

        <div className="flex-1 overflow-auto p-8">
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <User size={20} className="text-blue-600 dark:text-blue-400"/> Perfil de Administrador
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input type="email" value={userEmail} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                                <input type="text" value="Administrador" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200" readOnly />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Bell size={20} className="text-orange-500 dark:text-orange-400"/> Notificaciones
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Alertas de Sobrecarga</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Notificar cuando un empleado supera el 90% de carga</p>
                            </div>
                            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-blue-600 cursor-pointer">
                                <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform translate-x-6"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Shield size={20} className="text-green-600 dark:text-green-400"/> Seguridad
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cambiar Contraseña</label>
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    placeholder="Nueva contraseña" 
                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white dark:placeholder-slate-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button 
                                    onClick={handlePasswordChange}
                                    disabled={passwordLoading || !newPassword}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {passwordLoading ? '...' : 'Actualizar'}
                                </button>
                            </div>
                            {passwordMsg && (
                                <p className={`text-sm mt-2 ${passwordMsg.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {passwordMsg}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Maintenance Section */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden border-orange-100 dark:border-orange-900/30 transition-colors">
                    <div className="p-6 border-b border-orange-50 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-orange-800 dark:text-orange-300">
                            <Database size={20} className="text-orange-600 dark:text-orange-400"/> Mantenimiento del Sistema
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Detectar y reparar registros antiguos con datos faltantes (Carga NaN, Departamentos vacíos).
                        </p>
                        <button 
                            onClick={handleRepairData}
                            disabled={isRepairing}
                            className="bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {isRepairing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700 dark:border-orange-400"></div>
                                    Reparando...
                                </>
                            ) : (
                                <>
                                    <Wrench size={18} /> Reparar Base de Datos
                                </>
                            )}
                        </button>
                        {repairStatus && (
                            <p className="text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1">
                                {repairStatus}
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
}

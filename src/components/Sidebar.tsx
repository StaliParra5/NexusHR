import Link from 'next/link';
import { Activity, LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col p-6 transition-colors">
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Nexus<span className="text-blue-600">HR</span></span>
      </div>
      
      <nav className="space-y-1 flex-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link href="/team" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors">
          <Users size={18} /> Equipo
        </Link>
      </nav>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
         <Link href="/login" className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
           <LogOut size={16} /> Cerrar Sesión
         </Link>
      </div>
    </aside>
  );
}

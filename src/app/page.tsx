import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Zap size={32} />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">NexusHR System</h1>
        <p className="text-slate-500 mb-8">
          Sistema Empresarial RAD para gestión de recursos y análisis en tiempo real.
        </p>

        <div className="space-y-4">
          <Link 
            href="/dashboard"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            Ingresar al Sistema
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="flex justify-center items-center gap-2 text-xs text-slate-400 mt-6">
            <ShieldCheck size={14} />
            <span>Conexión Segura v2.0 (Supabase)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
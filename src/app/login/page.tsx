'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, User, Lock, Mail, Activity, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Assuming 'supabase' is imported or available globally.
// For example: import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // This line assumes 'supabase' is defined and imported correctly.
      // If not, you'll need to add an import like: import { supabase } from '@/lib/supabaseClient';
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
            <div className="inline-flex bg-white/20 p-3 rounded-xl mb-4 backdrop-blur-sm">
                <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">NexusHR</h1>
            <p className="text-blue-100">Gestión de Recursos</p>
        </div>

        {/* Form */}
        <div className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Iniciar Sesión</h2>
            
            {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="usuario@nexushr.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        Recordarme
                    </label>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">¿Olvidaste tu contraseña?</a>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Ingresar al Sistema <ArrowRight size={18} /></>
                    )}
                </button>
            </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
            &copy; 2024 NexusHR. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}

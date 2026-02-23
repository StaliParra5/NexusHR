'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'new-password',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-2.5 text-slate-400" size={20} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false); // sesión de recovery detectada

  // Supabase envía el token en el hash URL. Escuchamos el evento PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('La contraseña debe contener al menos un número.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Éxito → ir al dashboard con la sesión activa
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la contraseña. El enlace puede haber expirado.');
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

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Nueva Contraseña</h2>

          {!ready ? (
            /* Estado de espera mientras Supabase intercambia el token */
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-500">Verificando enlace de recuperación…</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 text-center mb-6">
                Elige una contraseña segura para tu cuenta.
              </p>

              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                  <PasswordInput value={password} onChange={setPassword} />
                  <p className="text-xs text-slate-400 mt-1">Mínimo 8 caracteres y al menos 1 número.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                  <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShieldCheck size={18} /> Actualizar Contraseña</>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
          &copy; 2024 NexusHR. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}

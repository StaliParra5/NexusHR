'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Activity, ArrowRight, UserPlus, Eye, EyeOff, KeyRound, ArrowLeft, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mode = 'login' | 'register' | 'forgot';

// ── Fuerza de contraseña ──────────────────────────────────────────────────────
function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: '', width: '0%' };
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [password.length >= 8, hasNumber, hasUpper, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { label: 'Débil', color: 'bg-red-500', width: '25%' };
  if (score === 2) return { label: 'Regular', color: 'bg-orange-400', width: '50%' };
  if (score === 3) return { label: 'Buena', color: 'bg-yellow-400', width: '75%' };
  return { label: 'Fuerte', color: 'bg-green-500', width: '100%' };
}

// ── Componente input password con toggle ─────────────────────────────────────
function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
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

// ── Página principal ──────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Autofocus al email al cambiar de modo
  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  const resetMessages = () => { setError(null); setSuccess(null); };

  const switchMode = (newMode: Mode, keepEmail = false) => {
    resetMessages();
    setPassword('');
    setConfirmPassword('');
    if (!keepEmail) setEmail('');
    setMode(newMode);
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ──────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Si Supabase devuelve sesión activa → auto-login (confirmación desactivada)
      if (data.session) {
        router.push('/dashboard');
        return;
      }

      // Si se requiere confirmación por email
      setSuccess('¡Cuenta creada! Revisa tu bandeja de entrada para confirmar tu email.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/update-password`
        : `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/update-password`;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      // Mensaje genérico: no revela si el email existe (previene enumeración de usuarios)
      setSuccess('Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña.');
    } catch (err: any) {
      setError('Hubo un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  // ── Textos por modo ───────────────────────────────────────────────────────
  const titles: Record<Mode, string> = {
    login: 'Iniciar Sesión',
    register: 'Crear Cuenta',
    forgot: 'Recuperar Contraseña',
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

        {/* Form area */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            {titles[mode]}
          </h2>

          {/* Error */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center mb-4">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div role="status" className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm text-center mb-4">
              {success}
            </div>
          )}

          {/* ── FORMULARIO LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={20} />
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="usuario@nexushr.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot', true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  id="remember"
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="cursor-pointer select-none">Recordarme</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><LogIn size={18} /> Ingresar al Sistema</>
                }
              </button>
            </form>
          )}

          {/* ── FORMULARIO REGISTER ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={20} />
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="usuario@nexushr.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
                {/* Indicador de fuerza */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Contraseña: <span className="font-medium">{passwordStrength.label}</span>
                      <span className="ml-2 text-slate-400">— mín. 8 caracteres y 1 número</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><UserPlus size={18} /> Crear Cuenta</>
                }
              </button>
            </form>
          )}

          {/* ── FORMULARIO FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-slate-500 text-center -mt-2 mb-2">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={20} />
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="usuario@nexushr.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><KeyRound size={18} /> Enviar Instrucciones</>
                }
              </button>

              <button
                type="button"
                onClick={() => switchMode('login', true)}
                className="w-full flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={15} /> Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* Switch login ↔ register */}
          {mode !== 'forgot' && (
            <p className="text-center text-sm text-slate-500 mt-6">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          )}
        </div>

        <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
          &copy; 2024 NexusHR. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}

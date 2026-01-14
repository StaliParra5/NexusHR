import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as UserIcon, Loader2, Moon, Sun, Check, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string>('Cargando...');
  const [userInitials, setUserInitials] = useState<string>('...');
  const [loading, setLoading] = useState(true);
  
  // Theme Dropdown State
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUserEmail(user.email);
        setUserInitials(user.email.substring(0, 2).toUpperCase());
      } else {
        setUserEmail('Invitado');
        setUserInitials('G');
      }
      setLoading(false);
    };
    getUser();

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
        if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
            setIsThemeOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    router.push('/settings');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 transition-colors">
      <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h1>
      
      <div className="flex items-center gap-4">
        
        {/* Theme Switcher */}
        <div className="relative" ref={themeRef}>
            <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
                title="Cambiar Tema"
            >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {/* Dropdown Slice */}
            {isThemeOpen && (
                <div className="absolute top-12 right-0 w-36 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => { toggleTheme('light'); setIsThemeOpen(false); }}
                        disabled={theme === 'light'}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                            ${theme === 'light' ? 'bg-slate-50 text-blue-600 font-medium cursor-default' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <Sun size={16} /> Claro
                        </div>
                        {theme === 'light' && <Check size={14} />}
                    </button>
                     <button 
                        onClick={() => { toggleTheme('dark'); setIsThemeOpen(false); }}
                        disabled={theme === 'dark'}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                            ${theme === 'dark' ? 'bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium cursor-default' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <Moon size={16} /> Oscuro
                        </div>
                        {theme === 'dark' && <Check size={14} />}
                    </button>
                </div>
            )}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {/* Profile */}
        <button 
            onClick={handleProfileClick}
            className="flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors group cursor-pointer"
            title="Ver Perfil y Configuración"
        >
            <div className="text-right hidden sm:block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {loading ? '...' : userEmail}
                </span>
                <span className="block text-xs text-slate-400">Ver opciones</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-700 shadow-sm group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-all">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : userInitials}
            </div>
        </button>
      </div>
    </header>
  );
}

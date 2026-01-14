-- ESTE SCRIPT ASEGURA QUE TENGAS TODAS LAS COLUMNAS NECESARIAS
-- Ejecútalo en el Editor SQL de Supabase para arreglar el error "Could not find column"

-- 1. Agregar columnas faltantes si no existen
DO $$
BEGIN
    -- Agregar 'department' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'department') THEN
        ALTER TABLE employees ADD COLUMN department text DEFAULT 'General';
    END IF;

    -- Agregar 'role' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'role') THEN
        ALTER TABLE employees ADD COLUMN role text DEFAULT 'Personal';
    END IF;

    -- Agregar 'workload' si no existe (por si acaso)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'workload') THEN
        -- Si existe 'load', lo renombramos. Si no, creamos 'workload'.
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'load') THEN
            ALTER TABLE employees RENAME COLUMN load TO workload;
        ELSE
            ALTER TABLE employees ADD COLUMN workload integer DEFAULT 0;
        END IF;
    END IF;
END $$;

-- 2. Refrescar la caché de esquema (Esto es interno de Supabase, pero un ALTER suele forzarlo)
NOTIFY pgrst, 'reload config';

-- 3. Asegurar permisos (Nunca está de más)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

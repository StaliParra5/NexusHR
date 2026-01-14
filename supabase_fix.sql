-- 1. CORREGIR DATOS CORRUPTOS (EJECUTAR PRIMERO)
-- Esto arregla los "NaN" y campos vacíos existentes
UPDATE employees SET workload = 0 WHERE workload IS NULL;
UPDATE employees SET department = 'General' WHERE department IS NULL OR department = '';
UPDATE employees SET role = 'Personal' WHERE role IS NULL OR role = '';
UPDATE employees SET status = 'Active' WHERE status IS NULL;

-- 2. EVITAR ERRORES FUTUROS (Defaults)
-- Esto asegura que si envías datos vacíos, la base de datos ponga un valor por defecto
ALTER TABLE employees ALTER COLUMN workload SET DEFAULT 0;
ALTER TABLE employees ALTER COLUMN department SET DEFAULT 'General';
ALTER TABLE employees ALTER COLUMN status SET DEFAULT 'Active';

-- 3. SOLUCIONAR EL ERROR DE PERMISOS (Fix Updates)
-- Habilita el acceso total para desarrollo (si estás usando la clave pública anon)
-- Opción A: Desactivar seguridad RLS (Más rápido para prototipos)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Opción B: Si prefieres mantener RLS activado, usa esta política:
-- CREATE POLICY "Acceso Total" ON employees FOR ALL USING (true) WITH CHECK (true);

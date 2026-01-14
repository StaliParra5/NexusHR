-- ⚠️ IMPORTANTE: Ejecuta esto si tu script anterior funcionó pero la App sigue fallando.

-- 1. RENOMBRAR COLUMNA (Unificar nombres)
-- La aplicación busca "workload", pero tu base de datos tiene "load".
-- Esto cambiará el nombre en la base de datos para que coincidan.
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'load') THEN
      ALTER TABLE employees RENAME COLUMN load TO workload;
  END IF;
END $$;

-- 2. ASEGURAR VALORES
-- Ahora que se llama "workload", aplicamos las correcciones que intentaste antes.
UPDATE employees SET workload = 0 WHERE workload IS NULL;
ALTER TABLE employees ALTER COLUMN workload SET DEFAULT 0;

-- 3. PERMISOS (Confirmación)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

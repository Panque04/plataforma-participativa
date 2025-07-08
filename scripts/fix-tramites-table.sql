-- PUNTO 1: Corregir estructura de tabla tramites
-- Agregar columna cedula que falta en la tabla tramites
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS cedula VARCHAR(20);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tramites_cedula ON tramites(cedula);

-- Actualizar datos existentes si los hay
UPDATE tramites 
SET cedula = cedula_usuario 
WHERE cedula IS NULL AND cedula_usuario IS NOT NULL;

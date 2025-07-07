-- Script adaptado para la estructura existente de Supabase
-- Basado en las tablas: tramites, usuarios, usuarios_temp

-- 1. Primero, vamos a ver qué columnas tiene la tabla tramites
-- (Ejecuta esto primero para verificar la estructura)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tramites' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Agregar columnas faltantes a la tabla tramites si no existen
DO $$ 
BEGIN
    -- Agregar user_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'user_id') THEN
        ALTER TABLE tramites ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
    
    -- Agregar estado si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'estado') THEN
        ALTER TABLE tramites ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_proceso', 'completado'));
    END IF;
    
    -- Agregar tipo_tramite si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'tipo_tramite') THEN
        ALTER TABLE tramites ADD COLUMN tipo_tramite VARCHAR(100);
    END IF;
    
    -- Agregar correo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'correo') THEN
        ALTER TABLE tramites ADD COLUMN correo VARCHAR(255);
    END IF;
    
    -- Agregar datos_adicionales si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'datos_adicionales') THEN
        ALTER TABLE tramites ADD COLUMN datos_adicionales JSONB;
    END IF;
    
    -- Agregar respuesta_admin si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'respuesta_admin') THEN
        ALTER TABLE tramites ADD COLUMN respuesta_admin TEXT;
    END IF;
    
    -- Agregar timestamps si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'created_at') THEN
        ALTER TABLE tramites ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'updated_at') THEN
        ALTER TABLE tramites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Renombrar cedula_solicitante a cedula si es necesario
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tramites' AND column_name = 'cedula_solicitante') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'tramites' AND column_name = 'cedula') THEN
        ALTER TABLE tramites RENAME COLUMN cedula_solicitante TO cedula;
    END IF;
END $$;

-- 3. Crear tabla user_profiles basada en la tabla usuarios existente
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'no_identificado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Migrar datos de usuarios a user_profiles si existen
INSERT INTO user_profiles (id, email, cedula, nombres, telefono, genero, created_at)
SELECT 
    gen_random_uuid(), -- Temporal, se actualizará cuando el usuario haga login
    COALESCE(email, 'sin-email@temp.com'),
    cedula,
    nombres,
    telefono,
    COALESCE(genero, 'no_identificado'),
    NOW()
FROM usuarios
WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.cedula = usuarios.cedula)
ON CONFLICT (cedula) DO NOTHING;

-- 5. Crear tabla de roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR(255), -- Para identificar por email también
    role VARCHAR(20) DEFAULT 'usuario' CHECK (role IN ('usuario', 'administrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear tabla para predios (geovisor)
CREATE TABLE IF NOT EXISTS predios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    codigo_anterior VARCHAR(50),
    departamento VARCHAR(100),
    municipio VARCHAR(100),
    direccion VARCHAR(255),
    area_terreno DECIMAL(15,2),
    area_construccion DECIMAL(15,2),
    matricula VARCHAR(50),
    geometria JSONB,
    propietario_cedula VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear índices
CREATE INDEX IF NOT EXISTS idx_tramites_cedula ON tramites(cedula);
CREATE INDEX IF NOT EXISTS idx_tramites_estado ON tramites(estado);
CREATE INDEX IF NOT EXISTS idx_tramites_user_id ON tramites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cedula ON user_profiles(cedula);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_predios_codigo ON predios(codigo);

-- 8. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predios ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de seguridad básicas
DROP POLICY IF EXISTS "Allow public read access to predios" ON predios;
CREATE POLICY "Allow public read access to predios" ON predios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to read own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to insert own profile" ON user_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = id);

-- 10. Políticas para trámites
DROP POLICY IF EXISTS "Users can view own tramites" ON tramites;
CREATE POLICY "Users can view own tramites" ON tramites
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrador')
);

DROP POLICY IF EXISTS "Users can insert own tramites" ON tramites;
CREATE POLICY "Users can insert own tramites" ON tramites
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tramites" ON tramites;
CREATE POLICY "Users can update own tramites" ON tramites
FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrador')
);

-- 11. Políticas para roles
DROP POLICY IF EXISTS "Users can view roles" ON user_roles;
CREATE POLICY "Users can view roles" ON user_roles
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrador')
);

-- 12. Función para hacer administrador por email
CREATE OR REPLACE FUNCTION make_user_admin_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id_var UUID;
    existing_role TEXT;
BEGIN
    -- Buscar el ID del usuario por email en auth.users
    SELECT id INTO user_id_var 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Si no se encuentra en auth.users, crear entrada temporal por email
    IF user_id_var IS NULL THEN
        -- Insertar rol por email (se actualizará cuando el usuario haga login)
        INSERT INTO user_roles (email, role) 
        VALUES (user_email, 'administrador')
        ON CONFLICT DO NOTHING;
        RETURN 'Usuario ' || user_email || ' marcado como administrador (se activará al hacer login)';
    END IF;
    
    -- Verificar si ya tiene un rol
    SELECT role INTO existing_role 
    FROM user_roles 
    WHERE user_id = user_id_var OR email = user_email;
    
    -- Si ya tiene rol, actualizarlo
    IF existing_role IS NOT NULL THEN
        UPDATE user_roles 
        SET role = 'administrador', user_id = user_id_var
        WHERE user_id = user_id_var OR email = user_email;
        RETURN 'Usuario ' || user_email || ' actualizado a administrador';
    ELSE
        -- Si no tiene rol, crear uno nuevo
        INSERT INTO user_roles (user_id, email, role) 
        VALUES (user_id_var, user_email, 'administrador');
        RETURN 'Usuario ' || user_email || ' configurado como administrador';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 13. Función para verificar si un usuario es admin por email
CREATE OR REPLACE FUNCTION is_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM user_roles 
        WHERE (email = user_email OR user_id = (
            SELECT id FROM auth.users WHERE email = user_email
        )) AND role = 'administrador'
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql;

-- 14. Insertar datos de ejemplo para predios
INSERT INTO predios (codigo, codigo_anterior, departamento, municipio, direccion, area_terreno, area_construccion, matricula, geometria) VALUES
('25793000000000060428000000000', '25793000000064280000', 'CUNDINAMARCA', 'TAUSA', 'GUANQUICA', 24492442, 1322, '172-15129', 
'{"type":"Polygon","coordinates":[[[-73.123,-5.456],[-73.124,-5.456],[-73.124,-5.457],[-73.123,-5.457],[-73.123,-5.456]]]}'),
('25793000000000060429000000000', '25793000000064290000', 'CUNDINAMARCA', 'TAUSA', 'CENTRO', 15000000, 2500, '172-15130',
'{"type":"Polygon","coordinates":[[[-73.125,-5.458],[-73.126,-5.458],[-73.126,-5.459],[-73.125,-5.459],[-73.125,-5.458]]]}')
ON CONFLICT (codigo) DO NOTHING;

-- 15. Función para obtener estadísticas
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_usuarios', (SELECT COUNT(*) FROM user_profiles),
        'total_tramites', (SELECT COUNT(*) FROM tramites),
        'tramites_pendientes', (SELECT COUNT(*) FROM tramites WHERE estado = 'pendiente'),
        'tramites_en_proceso', (SELECT COUNT(*) FROM tramites WHERE estado = 'en_proceso'),
        'tramites_completados', (SELECT COUNT(*) FROM tramites WHERE estado = 'completado')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

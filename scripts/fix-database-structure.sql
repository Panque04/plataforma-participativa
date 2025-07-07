-- Script para corregir la estructura de la base de datos paso a paso
-- Ejecutar cada sección por separado para evitar errores

-- SECCIÓN 1: Verificar estructura actual
SELECT 'Verificando tabla usuarios...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Verificando tabla tramites...' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tramites' AND table_schema = 'public'
ORDER BY ordinal_position;

-- SECCIÓN 2: Crear tabla user_profiles desde cero
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero VARCHAR(20) DEFAULT 'no_identificado' CHECK (genero IN ('masculino', 'femenino', 'no_identificado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SECCIÓN 3: Migrar datos de usuarios a user_profiles (si existe la tabla usuarios)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        INSERT INTO user_profiles (id, email, cedula, nombres, telefono, genero, created_at)
        SELECT 
            gen_random_uuid(), -- Se actualizará cuando el usuario haga login
            CASE 
                WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'email') 
                THEN email 
                ELSE 'sin-email@temp.com' 
            END,
            cedula,
            nombres,
            telefono,
            CASE 
                WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'genero') 
                THEN COALESCE(genero, 'no_identificado')
                ELSE 'no_identificado'
            END,
            NOW()
        FROM usuarios
        ON CONFLICT (cedula) DO NOTHING;
        
        RAISE NOTICE 'Datos migrados desde tabla usuarios';
    ELSE
        RAISE NOTICE 'Tabla usuarios no existe, continuando...';
    END IF;
END $$;

-- SECCIÓN 4: Actualizar tabla tramites
DO $$ 
BEGIN
    -- Agregar user_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'user_id') THEN
        ALTER TABLE tramites ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Columna user_id agregada a tramites';
    END IF;
    
    -- Agregar estado si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'estado') THEN
        ALTER TABLE tramites ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_proceso', 'completado'));
        RAISE NOTICE 'Columna estado agregada a tramites';
    END IF;
    
    -- Agregar tipo_tramite si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'tipo_tramite') THEN
        ALTER TABLE tramites ADD COLUMN tipo_tramite VARCHAR(100);
        RAISE NOTICE 'Columna tipo_tramite agregada a tramites';
    END IF;
    
    -- Agregar correo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'correo') THEN
        ALTER TABLE tramites ADD COLUMN correo VARCHAR(255);
        RAISE NOTICE 'Columna correo agregada a tramites';
    END IF;
    
    -- Agregar datos_adicionales si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'datos_adicionales') THEN
        ALTER TABLE tramites ADD COLUMN datos_adicionales JSONB;
        RAISE NOTICE 'Columna datos_adicionales agregada a tramites';
    END IF;
    
    -- Agregar respuesta_admin si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'respuesta_admin') THEN
        ALTER TABLE tramites ADD COLUMN respuesta_admin TEXT;
        RAISE NOTICE 'Columna respuesta_admin agregada a tramites';
    END IF;
    
    -- Agregar created_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'created_at') THEN
        ALTER TABLE tramites ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna created_at agregada a tramites';
    END IF;
    
    -- Agregar updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tramites' AND column_name = 'updated_at') THEN
        ALTER TABLE tramites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Columna updated_at agregada a tramites';
    END IF;
    
    -- Renombrar cedula_solicitante a cedula si es necesario
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tramites' AND column_name = 'cedula_solicitante') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'tramites' AND column_name = 'cedula') THEN
        ALTER TABLE tramites RENAME COLUMN cedula_solicitante TO cedula;
        RAISE NOTICE 'Columna cedula_solicitante renombrada a cedula';
    END IF;
END $$;

-- SECCIÓN 5: Crear tabla user_roles
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'usuario' CHECK (role IN ('usuario', 'administrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SECCIÓN 6: Crear tabla predios
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

-- SECCIÓN 7: Crear índices
CREATE INDEX IF NOT EXISTS idx_tramites_cedula ON tramites(cedula);
CREATE INDEX IF NOT EXISTS idx_tramites_estado ON tramites(estado);
CREATE INDEX IF NOT EXISTS idx_tramites_user_id ON tramites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cedula ON user_profiles(cedula);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_predios_codigo ON predios(codigo);

-- SECCIÓN 8: Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predios ENABLE ROW LEVEL SECURITY;

-- SECCIÓN 9: Políticas de seguridad
-- Predios (acceso público para lectura)
DROP POLICY IF EXISTS "Allow public read access to predios" ON predios;
CREATE POLICY "Allow public read access to predios" ON predios FOR SELECT USING (true);

-- User profiles
DROP POLICY IF EXISTS "Allow authenticated users to read own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to read own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to insert own profile" ON user_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON user_profiles;
CREATE POLICY "Allow authenticated users to update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = id);

-- Trámites
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

-- Roles
DROP POLICY IF EXISTS "Users can view roles" ON user_roles;
CREATE POLICY "Users can view roles" ON user_roles
FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'administrador')
);

-- SECCIÓN 10: Funciones útiles
CREATE OR REPLACE FUNCTION make_user_admin_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id_var UUID;
    existing_role TEXT;
BEGIN
    -- Buscar el ID del usuario por email
    SELECT id INTO user_id_var 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Si no se encuentra, crear entrada temporal por email
    IF user_id_var IS NULL THEN
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

-- SECCIÓN 11: Insertar datos de ejemplo para predios
INSERT INTO predios (codigo, codigo_anterior, departamento, municipio, direccion, area_terreno, area_construccion, matricula, geometria) VALUES
('25793000000000060428000000000', '25793000000064280000', 'CUNDINAMARCA', 'TAUSA', 'GUANQUICA', 24492442, 1322, '172-15129', 
'{"type":"Polygon","coordinates":[[[-73.123,-5.456],[-73.124,-5.456],[-73.124,-5.457],[-73.123,-5.457],[-73.123,-5.456]]]}'),
('25793000000000060429000000000', '25793000000064290000', 'CUNDINAMARCA', 'TAUSA', 'CENTRO', 15000000, 2500, '172-15130',
'{"type":"Polygon","coordinates":[[[-73.125,-5.458],[-73.126,-5.458],[-73.126,-5.459],[-73.125,-5.459],[-73.125,-5.458]]]}')
ON CONFLICT (codigo) DO NOTHING;

SELECT 'Base de datos configurada correctamente' as status;

-- SOLICITUD 1: Script completo para configurar la base de datos

-- 1. Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'no_identificado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de trámites con columna cedula
CREATE TABLE IF NOT EXISTS tramites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    cedula VARCHAR(20) NOT NULL, -- CORRECCIÓN: Campo cedula directo
    nombres VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    tipo_tramite VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado')),
    datos_adicionales JSONB,
    respuesta_admin TEXT,
    cedula_usuario VARCHAR(20), -- Campo de referencia adicional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'usuario' CHECK (role IN ('usuario', 'administrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla para predios (geovisor)
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

-- 5. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tramites_user_id ON tramites(user_id);
CREATE INDEX IF NOT EXISTS idx_tramites_estado ON tramites(estado);
CREATE INDEX IF NOT EXISTS idx_tramites_tipo ON tramites(tipo_tramite);
CREATE INDEX IF NOT EXISTS idx_tramites_cedula ON tramites(cedula);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cedula ON user_profiles(cedula);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_predios_codigo ON predios(codigo);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predios ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 8. Políticas de seguridad para tramites
DROP POLICY IF EXISTS "Users can view own tramites" ON tramites;
CREATE POLICY "Users can view own tramites" ON tramites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tramites" ON tramites;
CREATE POLICY "Users can insert own tramites" ON tramites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tramites" ON tramites;
CREATE POLICY "Users can update own tramites" ON tramites
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para administradores
DROP POLICY IF EXISTS "Admins can view all tramites" ON tramites;
CREATE POLICY "Admins can view all tramites" ON tramites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'administrador'
        )
    );

DROP POLICY IF EXISTS "Admins can update all tramites" ON tramites;
CREATE POLICY "Admins can update all tramites" ON tramites
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'administrador'
        )
    );

-- 9. Políticas para roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'administrador'
        )
    );

-- 10. Políticas para predios
DROP POLICY IF EXISTS "Everyone can view predios" ON predios;
CREATE POLICY "Everyone can view predios" ON predios
    FOR SELECT USING (true);

-- 11. Insertar datos de ejemplo para predios
INSERT INTO predios (codigo, codigo_anterior, departamento, municipio, direccion, area_terreno, area_construccion, matricula, geometria) VALUES
('25793000000000060428000000000', '25793000000064280000', 'CUNDINAMARCA', 'TAUSA', 'GUANQUICA', 24492442, 1322, '172-15129', 
'{"type":"Polygon","coordinates":[[[-73.123,-5.456],[-73.124,-5.456],[-73.124,-5.457],[-73.123,-5.457],[-73.123,-5.456]]]}'),
('25793000000000060429000000000', '25793000000064290000', 'CUNDINAMARCA', 'TAUSA', 'CENTRO', 15000000, 2500, '172-15130',
'{"type":"Polygon","coordinates":[[[-73.125,-5.458],[-73.126,-5.458],[-73.126,-5.459],[-73.125,-5.459],[-73.125,-5.458]]]}')
ON CONFLICT (codigo) DO NOTHING;

-- 12. SOLICITUD 3: Crear función para hacer administrador a un usuario
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id_var UUID;
    existing_role TEXT;
BEGIN
    -- Buscar el ID del usuario por email
    SELECT id INTO user_id_var 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Verificar si el usuario existe
    IF user_id_var IS NULL THEN
        RETURN 'Error: Usuario con email ' || user_email || ' no encontrado';
    END IF;
    
    -- Verificar si ya tiene un rol
    SELECT role INTO existing_role 
    FROM user_roles 
    WHERE user_id = user_id_var;
    
    -- Si ya tiene rol, actualizarlo
    IF existing_role IS NOT NULL THEN
        UPDATE user_roles 
        SET role = 'administrador' 
        WHERE user_id = user_id_var;
        RETURN 'Usuario ' || user_email || ' actualizado a administrador (rol anterior: ' || existing_role || ')';
    ELSE
        -- Si no tiene rol, crear uno nuevo
        INSERT INTO user_roles (user_id, role) 
        VALUES (user_id_var, 'administrador');
        RETURN 'Usuario ' || user_email || ' configurado como administrador';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 13. Crear función para ver estadísticas
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
        'tramites_completados', (SELECT COUNT(*) FROM tramites WHERE estado = 'completado'),
        'usuarios_por_genero', (
            SELECT json_object_agg(genero, count)
            FROM (
                SELECT genero, COUNT(*) as count
                FROM user_profiles
                GROUP BY genero
            ) as gender_stats
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

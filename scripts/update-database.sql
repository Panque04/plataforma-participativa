-- Actualizar tabla de trámites para usar cédula como referencia
ALTER TABLE tramites DROP CONSTRAINT IF EXISTS tramites_user_id_fkey;
ALTER TABLE tramites ADD COLUMN IF NOT EXISTS cedula_usuario VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_tramites_cedula_usuario ON tramites(cedula_usuario);

-- Agregar tabla de roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'usuario' CHECK (role IN ('usuario', 'administrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar tabla para predios (geovisor)
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

-- Agregar tabla para reset de contraseñas
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Políticas de seguridad
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predios ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Políticas para roles
CREATE POLICY "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'administrador'
        )
    );

-- Políticas para predios
CREATE POLICY "Everyone can view predios" ON predios
    FOR SELECT USING (true);

CREATE POLICY "Users can view own predios" ON predios
    FOR SELECT USING (propietario_cedula IN (
        SELECT cedula FROM user_profiles WHERE id = auth.uid()
    ));

-- Insertar rol de administrador por defecto (cambiar email por el tuyo)
INSERT INTO user_roles (user_id, role) 
SELECT id, 'administrador' 
FROM auth.users 
WHERE email = 'admin@tausa.gov.co'
ON CONFLICT DO NOTHING;

-- Datos de ejemplo para predios
INSERT INTO predios (codigo, codigo_anterior, departamento, municipio, direccion, area_terreno, area_construccion, matricula, geometria) VALUES
('25793000000000060428000000000', '25793000000064280000', 'CUNDINAMARCA', 'TAUSA', 'GUANQUICA', 24492442, 1322, '172-15129', 
'{"type":"Polygon","coordinates":[[[-73.123,-5.456],[-73.124,-5.456],[-73.124,-5.457],[-73.123,-5.457],[-73.123,-5.456]]]}'),
('25793000000000060429000000000', '25793000000064290000', 'CUNDINAMARCA', 'TAUSA', 'CENTRO', 15000000, 2500, '172-15130',
'{"type":"Polygon","coordinates":[[[-73.125,-5.458],[-73.126,-5.458],[-73.126,-5.459],[-73.125,-5.459],[-73.125,-5.458]]]}')
ON CONFLICT (codigo) DO NOTHING;

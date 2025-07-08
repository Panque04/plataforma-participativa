-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'femenino', 'no_identificado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de trámites
CREATE TABLE IF NOT EXISTS tramites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    tipo_tramite VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado')),
    datos_adicionales JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tramites_user_id ON tramites(user_id);
CREATE INDEX IF NOT EXISTS idx_tramites_estado ON tramites(estado);
CREATE INDEX IF NOT EXISTS idx_tramites_tipo ON tramites(tipo_tramite);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cedula ON user_profiles(cedula);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas de seguridad para tramites
CREATE POLICY "Users can view own tramites" ON tramites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tramites" ON tramites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tramites" ON tramites
    FOR UPDATE USING (auth.uid() = user_id);

-- ==================== SUPABASE SQL SETUP ====================
-- Execute este script no Supabase (SQL Editor) para configurar a conta admin

-- 1. Criar tabela de admins (se não existir)
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 2. Criar tabela de estudantes (se não existir)
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  className TEXT NOT NULL,
  user TEXT UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. Criar tabela de professores (se não existir)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  classes TEXT[] DEFAULT '{}',
  user TEXT UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. Criar tabela de turmas (se não existir)
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 5. Criar tabela de disciplinas (se não existir)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 6. Criar tabela de notas (se não existir)
CREATE TABLE IF NOT EXISTS grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  studentId UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  className TEXT NOT NULL,
  trimesters JSONB DEFAULT '{"1":{"n1":0,"n2":0,"n3":0,"recovery":false},"2":{"n1":0,"n2":0,"n3":0,"recovery":false},"3":{"n1":0,"n2":0,"n3":0,"recovery":false}}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 7. Criar tabela de notícias (se não existir)
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT,
  author TEXT,
  date TEXT,
  published BOOLEAN DEFAULT false,
  files JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 8. Criar tabela de eventos (se não existir)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 9. Criar tabela de atividades (se não existir)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  files JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 10. Criar tabela de conquistas (se não existir)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  files JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 11. Criar tabela de configuração da escola (se não existir)
CREATE TABLE IF NOT EXISTS school_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  history TEXT DEFAULT '',
  mission TEXT DEFAULT '',
  vision TEXT DEFAULT '',
  values TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  team JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 12. Inserir conta admin
INSERT INTO admins (user, password)
VALUES ('Admin', 'cetimns26')
ON CONFLICT (user) DO NOTHING;

-- 13. Inserir configuração inicial da escola
INSERT INTO school_config (id, history, mission, vision, values)
VALUES (
  gen_random_uuid(),
  'CETI Maria Neusa de Sousa - Centro Estadual de Tempo Integral',
  'Formar cidadãos críticos e competentes',
  'Excelência em educação integral',
  'Respeito, Responsabilidade, Inovação'
)
ON CONFLICT DO NOTHING;

-- ✅ Pronto! Execute este script no Supabase Dashboard
-- Ir em: Database → SQL Editor → Colar este código → Execute

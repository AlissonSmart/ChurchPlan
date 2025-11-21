-- ============================================
-- SCHEMA COMPLETO DO CHURCHPLAN
-- Sistema de Planejamento de Eventos para Igrejas
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: events (Eventos)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_minutes INTEGER,
  location VARCHAR(255),
  banner_image_url TEXT,
  template_id UUID,
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, completed, cancelled
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: event_steps (Etapas do Evento)
-- ============================================
CREATE TABLE IF NOT EXISTS event_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  step_time TIME,
  step_order INTEGER NOT NULL,
  is_header BOOLEAN DEFAULT FALSE, -- true para cabeçalhos, false para etapas normais
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: step_items (Itens das Etapas)
-- ============================================
CREATE TABLE IF NOT EXISTS step_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES event_steps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255), -- Ex: nome do artista
  duration_minutes INTEGER,
  item_time TIME,
  item_order INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: songs (Músicas)
-- ============================================
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  duration_minutes INTEGER,
  lyrics TEXT,
  chords TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: song_tags (Tags de Músicas)
-- ============================================
CREATE TABLE IF NOT EXISTS song_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL, -- Ex: Vocal, Violão, Piano, Bateria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: event_songs (Músicas do Evento)
-- ============================================
CREATE TABLE IF NOT EXISTS event_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  step_item_id UUID REFERENCES step_items(id) ON DELETE SET NULL,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  song_time TIME,
  song_order INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, ok, needs_review
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: ministries (Ministérios)
-- ============================================
CREATE TABLE IF NOT EXISTS ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Código hexadecimal da cor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: roles (Funções/Cargos)
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL, -- Ex: Vocal, Guitarra, Som, Vídeo
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: volunteers (Voluntários)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: volunteer_roles (Funções dos Voluntários)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
  skill_level INTEGER DEFAULT 1, -- 1-5
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volunteer_id, role_id)
);

-- ============================================
-- TABELA: event_team (Equipe do Evento)
-- ============================================
CREATE TABLE IF NOT EXISTS event_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  ministry_id UUID REFERENCES ministries(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'not_sent', -- not_sent, pending, confirmed, declined
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  response_at TIMESTAMP WITH TIME ZONE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: step_item_participants (Participantes dos Itens)
-- ============================================
CREATE TABLE IF NOT EXISTS step_item_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_item_id UUID NOT NULL REFERENCES step_items(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(step_item_id, volunteer_id)
);

-- ============================================
-- TABELA: extra_schedules (Horários Extras)
-- ============================================
CREATE TABLE IF NOT EXISTS extra_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  schedule_time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: volunteer_unavailability (Indisponibilidade de Voluntários)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_unavailability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: event_templates (Templates de Eventos)
-- ============================================
CREATE TABLE IF NOT EXISTS event_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Events
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_by ON events(created_by);

-- Event Steps
CREATE INDEX idx_event_steps_event_id ON event_steps(event_id);
CREATE INDEX idx_event_steps_order ON event_steps(step_order);

-- Step Items
CREATE INDEX idx_step_items_step_id ON step_items(step_id);
CREATE INDEX idx_step_items_order ON step_items(item_order);

-- Songs
CREATE INDEX idx_songs_title ON songs(title);
CREATE INDEX idx_songs_artist ON songs(artist);

-- Event Songs
CREATE INDEX idx_event_songs_event_id ON event_songs(event_id);
CREATE INDEX idx_event_songs_song_id ON event_songs(song_id);

-- Event Team
CREATE INDEX idx_event_team_event_id ON event_team(event_id);
CREATE INDEX idx_event_team_volunteer_id ON event_team(volunteer_id);
CREATE INDEX idx_event_team_status ON event_team(status);

-- Volunteers
CREATE INDEX idx_volunteers_email ON volunteers(email);
CREATE INDEX idx_volunteers_active ON volunteers(is_active);

-- Volunteer Unavailability
CREATE INDEX idx_volunteer_unavailability_dates ON volunteer_unavailability(volunteer_id, start_date, end_date);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_steps_updated_at BEFORE UPDATE ON event_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_step_items_updated_at BEFORE UPDATE ON step_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_songs_updated_at BEFORE UPDATE ON event_songs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON ministries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_team_updated_at BEFORE UPDATE ON event_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extra_schedules_updated_at BEFORE UPDATE ON extra_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_unavailability_updated_at BEFORE UPDATE ON volunteer_unavailability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_templates_updated_at BEFORE UPDATE ON event_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir ministérios padrão
INSERT INTO ministries (name, description, color) VALUES
  ('Ministério de Louvor', 'Responsável pela música e adoração', '#5fccb3'),
  ('Equipe Técnica', 'Responsável por som, vídeo e iluminação', '#6366F1'),
  ('Equipe de Apoio', 'Responsável por logística e suporte', '#FF9500')
ON CONFLICT DO NOTHING;

-- Inserir funções padrão
INSERT INTO roles (name, description) VALUES
  ('Vocal', 'Cantor(a)'),
  ('Violão', 'Violonista'),
  ('Guitarra', 'Guitarrista'),
  ('Baixo', 'Baixista'),
  ('Bateria', 'Baterista'),
  ('Teclado', 'Tecladista'),
  ('Piano', 'Pianista'),
  ('Som', 'Operador de som'),
  ('Vídeo', 'Operador de vídeo'),
  ('Iluminação', 'Operador de iluminação'),
  ('Projeção', 'Operador de projeção')
ON CONFLICT DO NOTHING;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo (ajustar conforme autenticação)
-- Permitir leitura para todos autenticados
CREATE POLICY "Allow read for authenticated users" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON volunteers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserção/atualização para criadores
CREATE POLICY "Allow insert for authenticated users" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for event creators" ON events
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para eventos com contagem de equipe
CREATE OR REPLACE VIEW events_with_team_count AS
SELECT 
  e.*,
  COUNT(DISTINCT et.volunteer_id) as team_count,
  COUNT(DISTINCT CASE WHEN et.status = 'confirmed' THEN et.volunteer_id END) as confirmed_count,
  COUNT(DISTINCT CASE WHEN et.status = 'pending' THEN et.volunteer_id END) as pending_count
FROM events e
LEFT JOIN event_team et ON e.id = et.event_id
GROUP BY e.id;

-- View para voluntários com suas funções
CREATE OR REPLACE VIEW volunteers_with_roles AS
SELECT 
  v.*,
  json_agg(
    json_build_object(
      'role_id', r.id,
      'role_name', r.name,
      'ministry_id', m.id,
      'ministry_name', m.name
    )
  ) as roles
FROM volunteers v
LEFT JOIN volunteer_roles vr ON v.id = vr.volunteer_id
LEFT JOIN roles r ON vr.role_id = r.id
LEFT JOIN ministries m ON vr.ministry_id = m.id
GROUP BY v.id;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE events IS 'Eventos principais do sistema';
COMMENT ON TABLE event_steps IS 'Etapas e cabeçalhos dos eventos';
COMMENT ON TABLE step_items IS 'Itens individuais dentro de cada etapa';
COMMENT ON TABLE songs IS 'Biblioteca de músicas';
COMMENT ON TABLE event_songs IS 'Músicas associadas a eventos específicos';
COMMENT ON TABLE ministries IS 'Ministérios da igreja';
COMMENT ON TABLE roles IS 'Funções/cargos disponíveis';
COMMENT ON TABLE volunteers IS 'Cadastro de voluntários';
COMMENT ON TABLE event_team IS 'Equipe escalada para cada evento';
COMMENT ON TABLE extra_schedules IS 'Horários extras como ensaios e preparações';
COMMENT ON TABLE volunteer_unavailability IS 'Períodos de indisponibilidade dos voluntários';

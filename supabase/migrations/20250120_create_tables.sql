-- ============================================
-- CRIAÇÃO DE TABELAS NECESSÁRIAS - ChurchPlan
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: notifications (Notificações)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_id UUID,
  event_name VARCHAR(255),
  event_date DATE,
  event_time TIME,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================
-- TABELA: events (Eventos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  duration_minutes INTEGER,
  location VARCHAR(255),
  banner_image_url TEXT,
  template_id UUID,
  status VARCHAR(50) DEFAULT 'draft',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- ============================================
-- TABELA: ministries (Ministérios)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: roles (Funções/Cargos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_ministry_id ON public.roles(ministry_id);

-- ============================================
-- TABELA: volunteers (Voluntários)
-- ============================================
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON public.volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_active ON public.volunteers(is_active);

-- ============================================
-- TABELA: event_team (Equipe do Evento)
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'not_sent',
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  response_at TIMESTAMP WITH TIME ZONE,
  is_highlighted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_team_event_id ON public.event_team(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_volunteer_id ON public.event_team(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_event_team_status ON public.event_team(status);

-- ============================================
-- TABELA: event_steps (Etapas do Evento)
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  step_time TIME,
  step_order INTEGER NOT NULL,
  is_header BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_steps_event_id ON public.event_steps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_steps_order ON public.event_steps(step_order);

-- ============================================
-- TABELA: step_items (Itens das Etapas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.step_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES public.event_steps(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  duration_minutes INTEGER,
  item_time TIME,
  item_order INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_step_items_step_id ON public.step_items(step_id);
CREATE INDEX IF NOT EXISTS idx_step_items_order ON public.step_items(item_order);

-- ============================================
-- TABELA: songs (Músicas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.songs (
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

CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON public.songs(artist);

-- ============================================
-- TABELA: event_songs (Músicas do Evento)
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  step_item_id UUID REFERENCES public.step_items(id) ON DELETE SET NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  song_time TIME,
  song_order INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_songs_event_id ON public.event_songs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_songs_song_id ON public.event_songs(song_id);

-- ============================================
-- TABELA: extra_schedules (Horários Extras)
-- ============================================
CREATE TABLE IF NOT EXISTS public.extra_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  schedule_time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_extra_schedules_event_id ON public.extra_schedules(event_id);

-- ============================================
-- TABELA: volunteer_roles (Funções dos Voluntários)
-- ============================================
CREATE TABLE IF NOT EXISTS public.volunteer_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  skill_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(volunteer_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_roles_volunteer_id ON public.volunteer_roles(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_roles_role_id ON public.volunteer_roles(role_id);

-- ============================================
-- TABELA: volunteer_unavailability (Indisponibilidade)
-- ============================================
CREATE TABLE IF NOT EXISTS public.volunteer_unavailability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_unavailability_dates ON public.volunteer_unavailability(volunteer_id, start_date, end_date);

-- ============================================
-- TABELA: step_item_participants (Participantes dos Itens)
-- ============================================
CREATE TABLE IF NOT EXISTS public.step_item_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_item_id UUID NOT NULL REFERENCES public.step_items(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(step_item_id, volunteer_id)
);

CREATE INDEX IF NOT EXISTS idx_step_item_participants_step_item_id ON public.step_item_participants(step_item_id);
CREATE INDEX IF NOT EXISTS idx_step_item_participants_volunteer_id ON public.step_item_participants(volunteer_id);

-- ============================================
-- TABELA: event_templates (Templates de Eventos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_templates (
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
-- FUNÇÕES E TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_steps_updated_at ON public.event_steps;
CREATE TRIGGER update_event_steps_updated_at BEFORE UPDATE ON public.event_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_step_items_updated_at ON public.step_items;
CREATE TRIGGER update_step_items_updated_at BEFORE UPDATE ON public.step_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_songs_updated_at ON public.songs;
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_songs_updated_at ON public.event_songs;
CREATE TRIGGER update_event_songs_updated_at BEFORE UPDATE ON public.event_songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_team_updated_at ON public.event_team;
CREATE TRIGGER update_event_team_updated_at BEFORE UPDATE ON public.event_team
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ministries_updated_at ON public.ministries;
CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON public.ministries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteers_updated_at ON public.volunteers;
CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_extra_schedules_updated_at ON public.extra_schedules;
CREATE TRIGGER update_extra_schedules_updated_at BEFORE UPDATE ON public.extra_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteer_unavailability_updated_at ON public.volunteer_unavailability;
CREATE TRIGGER update_volunteer_unavailability_updated_at BEFORE UPDATE ON public.volunteer_unavailability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_templates_updated_at ON public.event_templates;
CREATE TRIGGER update_event_templates_updated_at BEFORE UPDATE ON public.event_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

INSERT INTO public.ministries (name, description, color) VALUES
  ('Ministério de Louvor', 'Responsável pela música e adoração', '#5fccb3'),
  ('Equipe Técnica', 'Responsável por som, vídeo e iluminação', '#6366F1'),
  ('Equipe de Apoio', 'Responsável por logística e suporte', '#FF9500')
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, description) VALUES
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

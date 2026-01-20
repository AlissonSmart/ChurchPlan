-- ============================================
-- LIMPAR POLÍTICAS RLS PROBLEMÁTICAS
-- ============================================

-- Remover todas as políticas RLS
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated users to insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.events;
DROP POLICY IF EXISTS "Allow update for event creators" ON public.events;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.event_team;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.event_team;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.volunteers;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.volunteers;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.teams;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.teams;

-- Desabilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_team DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ministries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.step_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.extra_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volunteer_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volunteer_unavailability DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.step_item_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_templates DISABLE ROW LEVEL SECURITY;

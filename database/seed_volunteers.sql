-- ============================================
-- SEED DATA: Voluntários de Exemplo
-- ============================================

-- Inserir voluntários de exemplo
-- NOTA: user_id deve ser preenchido com IDs reais de usuários autenticados
-- Para teste, deixe NULL ou vincule com usuários existentes

INSERT INTO volunteers (first_name, last_name, email, phone, is_active) VALUES
('João', 'Silva', 'joao.silva@email.com', '(11) 98765-4321', true),
('Maria', 'Santos', 'maria.santos@email.com', '(11) 98765-4322', true),
('Pedro', 'Costa', 'pedro.costa@email.com', '(11) 98765-4323', true),
('Ana', 'Lima', 'ana.lima@email.com', '(11) 98765-4324', true),
('Carlos', 'Mendes', 'carlos.mendes@email.com', '(11) 98765-4325', true),
('Roberto', 'Silva', 'roberto.silva@email.com', '(11) 98765-4326', true),
('Fernanda', 'Costa', 'fernanda.costa@email.com', '(11) 98765-4327', true),
('Paulo', 'Santos', 'paulo.santos@email.com', '(11) 98765-4328', true),
('Juliana', 'Oliveira', 'juliana.oliveira@email.com', '(11) 98765-4329', true),
('Ricardo', 'Alves', 'ricardo.alves@email.com', '(11) 98765-4330', true),
('Camila', 'Rodrigues', 'camila.rodrigues@email.com', '(11) 98765-4331', true),
('Bruno', 'Ferreira', 'bruno.ferreira@email.com', '(11) 98765-4332', true),
('Patrícia', 'Martins', 'patricia.martins@email.com', '(11) 98765-4333', true),
('Lucas', 'Pereira', 'lucas.pereira@email.com', '(11) 98765-4334', true),
('Amanda', 'Souza', 'amanda.souza@email.com', '(11) 98765-4335', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir ministérios de exemplo (se não existirem)
INSERT INTO ministries (name, description) VALUES
('Louvor', 'Ministério de Louvor e Adoração'),
('Técnica', 'Equipe Técnica (Som, Vídeo, Iluminação)'),
('Intercessão', 'Ministério de Intercessão e Oração'),
('Recepção', 'Equipe de Recepção e Acolhimento')
ON CONFLICT DO NOTHING;

-- Inserir funções de exemplo (se não existirem)
INSERT INTO roles (name, description) VALUES
('Vocal', 'Vocalista/Cantor'),
('Teclado', 'Tecladista'),
('Guitarra', 'Guitarrista'),
('Baixo', 'Baixista'),
('Bateria', 'Baterista'),
('Violão', 'Violonista'),
('Som', 'Técnico de Som'),
('Vídeo', 'Operador de Vídeo'),
('Iluminação', 'Operador de Iluminação'),
('Líder', 'Líder de Ministério')
ON CONFLICT DO NOTHING;

-- Associar voluntários com funções (volunteer_roles)
-- Você pode descomentar e ajustar conforme necessário
/*
INSERT INTO volunteer_roles (volunteer_id, role_id, ministry_id, skill_level)
SELECT 
  v.id,
  r.id,
  m.id,
  3 -- skill_level padrão
FROM volunteers v
CROSS JOIN roles r
CROSS JOIN ministries m
WHERE v.email = 'joao.silva@email.com'
  AND r.name = 'Vocal'
  AND m.name = 'Louvor'
ON CONFLICT DO NOTHING;
*/

-- Verificar dados inseridos
SELECT 
  id,
  first_name || ' ' || last_name as nome_completo,
  email,
  phone,
  is_active
FROM volunteers
ORDER BY first_name;

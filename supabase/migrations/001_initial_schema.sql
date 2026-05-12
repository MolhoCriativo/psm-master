-- PSM Master - Schema Completo
-- Execute no SQL Editor do Supabase

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE topic_enum AS ENUM ('framework', 'eventos', 'papeis', 'artefatos');
CREATE TYPE difficulty_enum AS ENUM ('basico', 'intermediario', 'avancado');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS BANK
-- ============================================================
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic topic_enum NOT NULL,
  difficulty difficulty_enum DEFAULT 'intermediario',
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- [{ "id": "a", "text": "..." }, ...]
  correct_option TEXT NOT NULL, -- "a" | "b" | "c" | "d"
  explanation TEXT NOT NULL,
  scrum_guide_ref TEXT, -- reference to Scrum Guide section
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXAM SESSIONS
-- ============================================================
CREATE TABLE exam_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  total_questions INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  score NUMERIC(5,2) DEFAULT 0, -- 0-100
  duration_seconds INT, -- tempo total
  topics_covered topic_enum[],
  status TEXT DEFAULT 'in_progress' -- 'in_progress' | 'completed' | 'abandoned'
);

-- ============================================================
-- EXAM ANSWERS (individual answers within a session)
-- ============================================================
CREATE TABLE exam_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INT,
  ai_explanation TEXT, -- cached AI explanation for wrong answers
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEARNING TRAIL PROGRESS
-- ============================================================
CREATE TABLE trail_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic topic_enum NOT NULL,
  lessons_completed INT DEFAULT 0,
  total_lessons INT NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- ============================================================
-- USER STATS (aggregated, updated via triggers)
-- ============================================================
CREATE TABLE user_stats (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_exams INT DEFAULT 0,
  total_questions_answered INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  mastery_score NUMERIC(5,2) DEFAULT 0, -- weighted mastery %
  current_streak INT DEFAULT 0, -- dias consecutivos
  last_exam_at TIMESTAMPTZ,
  weak_topics topic_enum[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WEAK AREAS (per topic, per user)
-- ============================================================
CREATE TABLE topic_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic topic_enum NOT NULL,
  total_answered INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- ============================================================
-- SPACED REPETITION QUEUE
-- ============================================================
CREATE TABLE review_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  times_wrong INT DEFAULT 1,
  next_review_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 day',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trail_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions (all authenticated users can read)
CREATE POLICY "Authenticated users can read questions" ON questions FOR SELECT TO authenticated USING (active = true);

-- Exam sessions
CREATE POLICY "Users manage own sessions" ON exam_sessions FOR ALL USING (auth.uid() = user_id);

-- Exam answers
CREATE POLICY "Users manage own answers" ON exam_answers FOR ALL USING (auth.uid() = user_id);

-- Trail progress
CREATE POLICY "Users manage own trail" ON trail_progress FOR ALL USING (auth.uid() = user_id);

-- User stats
CREATE POLICY "Users view own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);

-- Topic performance
CREATE POLICY "Users manage own performance" ON topic_performance FOR ALL USING (auth.uid() = user_id);

-- Review queue
CREATE POLICY "Users manage own queue" ON review_queue FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO user_stats (user_id) VALUES (NEW.id);
  
  -- Initialize trail progress
  INSERT INTO trail_progress (user_id, topic, total_lessons, unlocked) VALUES
    (NEW.id, 'framework', 10, true),
    (NEW.id, 'eventos', 5, false),
    (NEW.id, 'papeis', 3, false),
    (NEW.id, 'artefatos', 3, false);
  
  -- Initialize topic performance
  INSERT INTO topic_performance (user_id, topic) VALUES
    (NEW.id, 'framework'),
    (NEW.id, 'eventos'),
    (NEW.id, 'papeis'),
    (NEW.id, 'artefatos');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNCTION: Update stats after exam
-- ============================================================
CREATE OR REPLACE FUNCTION update_user_stats_after_exam()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    -- Update user_stats
    UPDATE user_stats
    SET 
      total_exams = total_exams + 1,
      total_questions_answered = total_questions_answered + NEW.total_questions,
      total_correct = total_correct + NEW.correct_answers,
      average_score = (
        SELECT AVG(score) FROM exam_sessions 
        WHERE user_id = NEW.user_id AND status = 'completed'
      ),
      last_exam_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_exam_completed
  AFTER UPDATE ON exam_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_stats_after_exam();

-- ============================================================
-- SEED: Sample Questions
-- ============================================================
INSERT INTO questions (topic, difficulty, question_text, options, correct_option, explanation, scrum_guide_ref) VALUES
(
  'framework', 'basico',
  'Qual é o principal objetivo do Scrum?',
  '[{"id":"a","text":"Garantir que todos os requisitos sejam entregues no prazo"},{"id":"b","text":"Desenvolver e sustentar produtos complexos através de colaboração, accountability e progresso iterativo"},{"id":"c","text":"Eliminar a necessidade de documentação técnica"},{"id":"d","text":"Substituir metodologias tradicionais de gestão de projetos"}]',
  'b',
  'O Scrum é um framework leve que ajuda pessoas, times e organizações a gerar valor através de soluções adaptativas para problemas complexos. Seu foco principal está na entrega iterativa de valor, não em garantir todos os requisitos ou eliminar documentação.',
  'Scrum Guide 2020 - Propósito do Scrum'
),
(
  'framework', 'intermediario',
  'O que define a transparência no contexto dos Pilares do Scrum?',
  '[{"id":"a","text":"Todos os membros do time devem ter acesso ao código-fonte"},{"id":"b","text":"O processo emergente e o trabalho devem ser visíveis para quem executa e para quem recebe o trabalho"},{"id":"c","text":"Os relatórios de progresso devem ser enviados semanalmente aos stakeholders"},{"id":"d","text":"O Product Owner deve compartilhar todas as decisões de negócio com o time"}]',
  'b',
  'A Transparência, primeiro pilar do Scrum, requer que o processo emergente e o trabalho sejam visíveis para quem executa e para quem recebe o trabalho. Isso permite inspeção e adaptação eficazes.',
  'Scrum Guide 2020 - Pilares do Scrum'
),
(
  'eventos', 'intermediario',
  'Qual é o time-box máximo de uma Sprint Review para uma Sprint de 4 semanas?',
  '[{"id":"a","text":"2 horas"},{"id":"b","text":"4 horas"},{"id":"c","text":"8 horas"},{"id":"d","text":"Sem limite definido"}]',
  'b',
  'A Sprint Review tem um time-box de 4 horas para uma Sprint de um mês. Para Sprints mais curtas, o evento geralmente é mais curto. O time-box garante foco e evita discussões improdutivas.',
  'Scrum Guide 2020 - Sprint Review'
),
(
  'eventos', 'avancado',
  'O que acontece se uma Sprint for cancelada pelo Product Owner?',
  '[{"id":"a","text":"O time refaz o planejamento e inicia uma nova Sprint imediatamente"},{"id":"b","text":"Quaisquer itens do Product Backlog concluídos e "Prontos" são revisados. Se algum trabalho for potencialmente utilizável, é tipicamente aceito pelo Product Owner"},{"id":"c","text":"Todos os itens voltam ao Product Backlog sem revisão"},{"id":"d","text":"O Scrum Master decide quais itens serão aproveitados"}]',
  'b',
  'Quando uma Sprint é cancelada, os itens do Product Backlog que foram concluídos e "Prontos" são revisados. Se parte do trabalho for potencialmente entregável, é aceita. Os itens incompletos são re-estimados e retornam ao Product Backlog.',
  'Scrum Guide 2020 - Cancelamento de Sprint'
),
(
  'papeis', 'basico',
  'Quem é responsável por maximizar o valor do produto resultante do trabalho do Scrum Team?',
  '[{"id":"a","text":"O Scrum Master"},{"id":"b","text":"Os Developers"},{"id":"c","text":"O Product Owner"},{"id":"d","text":"Os Stakeholders"}]',
  'c',
  'O Product Owner é responsável por maximizar o valor do produto resultante do trabalho do Scrum Team. Como isso é feito pode variar amplamente entre organizações, Scrum Teams e indivíduos.',
  'Scrum Guide 2020 - Product Owner'
),
(
  'papeis', 'intermediario',
  'O Scrum Master pode fazer parte dos Developers no mesmo Scrum Team?',
  '[{"id":"a","text":"Não, o Scrum Guide proíbe explicitamente essa combinação"},{"id":"b","text":"Sim, embora não seja recomendado, pois pode criar conflito de interesses"},{"id":"c","text":"Apenas em times com menos de 3 membros"},{"id":"d","text":"Somente se aprovado pelos stakeholders"}]',
  'b',
  'O Scrum Master pode assumir outros papéis no mesmo time, incluindo ser um Developer, embora isso possa criar conflito de interesses. O Scrum Guide não proíbe, mas ressalta os riscos dessa combinação.',
  'Scrum Guide 2020 - Scrum Master'
),
(
  'artefatos', 'basico',
  'Qual é a medida de compromisso do Sprint Backlog?',
  '[{"id":"a","text":"Meta do Produto"},{"id":"b","text":"Definição de Pronto"},{"id":"c","text":"Meta da Sprint"},{"id":"d","text":"Incremento"}]',
  'c',
  'A Meta da Sprint é o compromisso do Sprint Backlog. Ela fornece foco e coerência ao trabalho da Sprint, incentivando o Scrum Team a trabalhar em conjunto em vez de iniciativas separadas.',
  'Scrum Guide 2020 - Sprint Backlog'
),
(
  'artefatos', 'intermediario',
  'O que é o Incremento no Scrum?',
  '[{"id":"a","text":"O conjunto de todas as histórias de usuário planejadas para a Sprint"},{"id":"b","text":"Uma etapa concreta em direção à Meta do Produto, devendo atender à Definição de Pronto"},{"id":"c","text":"O relatório de progresso entregue ao Product Owner"},{"id":"d","text":"A documentação técnica produzida durante a Sprint"}]',
  'b',
  'Um Incremento é uma etapa concreta em direção à Meta do Produto. Cada Incremento é adicionado a todos os Incrementos anteriores e verificado, garantindo que todos os Incrementos funcionem juntos. Deve atender à Definição de Pronto.',
  'Scrum Guide 2020 - Incremento'
),
(
  'framework', 'avancado',
  'Qual afirmação sobre os Valores do Scrum está correta?',
  '[{"id":"a","text":"São opcionais e podem ser adaptados conforme a cultura da organização"},{"id":"b","text":"Quando os valores de comprometimento, foco, abertura, respeito e coragem são incorporados, os pilares do Scrum ganham vida"},{"id":"c","text":"Os valores do Scrum substituem os princípios do Manifesto Ágil"},{"id":"d","text":"São responsabilidade exclusiva do Scrum Master disseminar esses valores"}]',
  'b',
  'Os cinco valores do Scrum - comprometimento, foco, abertura, respeito e coragem - quando verdadeiramente incorporados pelo Scrum Team, ganham vida e constroem confiança. Os pilares de transparência, inspeção e adaptação dependem desses valores.',
  'Scrum Guide 2020 - Valores do Scrum'
),
(
  'eventos', 'basico',
  'Qual é o propósito da Daily Scrum?',
  '[{"id":"a","text":"Reportar o progresso individual ao Scrum Master"},{"id":"b","text":"Inspecionar o progresso em direção à Meta da Sprint e adaptar o Sprint Backlog conforme necessário"},{"id":"c","text":"Planejar as tarefas do dia para cada membro do time"},{"id":"d","text":"Identificar impedimentos para o Product Owner resolver"}]',
  'b',
  'O propósito da Daily Scrum é inspecionar o progresso em direção à Meta da Sprint e adaptar o Sprint Backlog conforme necessário, ajustando o trabalho planejado futuro. É um evento de 15 minutos dos Developers para os Developers.',
  'Scrum Guide 2020 - Daily Scrum'
);

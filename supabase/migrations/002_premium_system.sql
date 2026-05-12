-- ============================================================
-- MIGRATION: Sistema de Pagamento + Trilhas Desbloqueadas
-- Execute no Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Adicionar campo is_premium na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- 2. Adicionar campo free_limit e premium_limit em trail_progress
ALTER TABLE public.trail_progress
  ADD COLUMN IF NOT EXISTS free_questions_limit INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS premium_questions_limit INT DEFAULT 25;

-- 3. Desbloquear TODAS as trilhas para todos os usuários existentes
UPDATE public.trail_progress
SET unlocked = true;

-- 4. Atualizar o trigger para desbloquear todas as trilhas ao criar conta
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, is_premium)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Todas as trilhas desbloqueadas desde o início
  INSERT INTO public.trail_progress (user_id, topic, total_lessons, unlocked, free_questions_limit, premium_questions_limit)
  VALUES
    (NEW.id, 'framework', 10, true, 5, 25),
    (NEW.id, 'eventos',   5,  true, 5, 25),
    (NEW.id, 'papeis',    3,  true, 5, 25),
    (NEW.id, 'artefatos', 3,  true, 5, 25)
  ON CONFLICT (user_id, topic) DO NOTHING;

  INSERT INTO public.topic_performance (user_id, topic)
  VALUES
    (NEW.id, 'framework'),
    (NEW.id, 'eventos'),
    (NEW.id, 'papeis'),
    (NEW.id, 'artefatos')
  ON CONFLICT (user_id, topic) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. Tabela de purchases/payments
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_cents INT NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending', -- pending | completed | refunded
  payment_provider TEXT DEFAULT 'manual', -- stripe | pix | manual
  provider_ref TEXT, -- ID externo do pagamento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);

-- 6. Function para ativar premium após compra
CREATE OR REPLACE FUNCTION activate_premium(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    is_premium = true,
    premium_since = NOW(),
    premium_expires_at = NULL -- sem expiração por enquanto (pagamento único)
  WHERE id = p_user_id;
END;
$$;

-- 7. Verificar resultado
SELECT
  u.id,
  p.is_premium,
  COUNT(tp.topic) as trilhas_desbloqueadas
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.trail_progress tp ON tp.user_id = u.id AND tp.unlocked = true
GROUP BY u.id, p.is_premium;

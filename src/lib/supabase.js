import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInWithProvider = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Questions
export const fetchQuestions = async (topic = null, limit = 10) => {
  let query = supabase.from('questions').select('*').eq('active', true);
  if (topic) query = query.eq('topic', topic);
  const { data, error } = await query.limit(limit);
  return { data, error };
};

export const fetchRandomQuestions = async (count = 20) => {
  // Fetch a pool and shuffle client-side (Supabase doesn't natively random-order)
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('active', true)
    .limit(count * 3); // get extra to shuffle from
  if (error) return { data: null, error };
  const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, count);
  return { data: shuffled, error: null };
};

// Exam sessions
export const createExamSession = async (userId, totalQuestions) => {
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({ user_id: userId, total_questions: totalQuestions, status: 'in_progress' })
    .select()
    .single();
  return { data, error };
};

export const finishExamSession = async (sessionId, correctAnswers, totalQuestions, durationSeconds) => {
  const score = (correctAnswers / totalQuestions) * 100;
  const { data, error } = await supabase
    .from('exam_sessions')
    .update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      correct_answers: correctAnswers,
      score: score.toFixed(2),
      duration_seconds: durationSeconds,
    })
    .eq('id', sessionId)
    .select()
    .single();
  return { data, error };
};

export const saveExamAnswer = async (sessionId, userId, questionId, selectedOption, isCorrect, timeSpent) => {
  const { data, error } = await supabase
    .from('exam_answers')
    .insert({
      session_id: sessionId,
      user_id: userId,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
    })
    .select()
    .single();

  // Update topic performance
  const { data: qData } = await supabase.from('questions').select('topic').eq('id', questionId).single();
  if (qData) {
    const { data: existing } = await supabase
      .from('topic_performance')
      .select('*')
      .eq('user_id', userId)
      .eq('topic', qData.topic)
      .single();

    if (existing) {
      const newTotal = existing.total_answered + 1;
      const newCorrect = existing.total_correct + (isCorrect ? 1 : 0);
      await supabase
        .from('topic_performance')
        .update({
          total_answered: newTotal,
          total_correct: newCorrect,
          accuracy: ((newCorrect / newTotal) * 100).toFixed(2),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('topic', qData.topic);
    }
  }

  // Add to review queue if wrong
  if (!isCorrect) {
    const { data: existing } = await supabase
      .from('review_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single();

    if (existing) {
      await supabase
        .from('review_queue')
        .update({
          times_wrong: existing.times_wrong + 1,
          next_review_at: new Date(Date.now() + (existing.times_wrong + 1) * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('review_queue')
        .insert({ user_id: userId, question_id: questionId });
    }
  }

  return { data, error };
};

// User stats & profile
export const fetchUserStats = async (userId) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const fetchTopicPerformance = async (userId) => {
  const { data, error } = await supabase
    .from('topic_performance')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
};

export const fetchTrailProgress = async (userId) => {
  const { data, error } = await supabase
    .from('trail_progress')
    .select('*')
    .eq('user_id', userId)
    .order('topic');
  return { data, error };
};

export const fetchRecentExams = async (userId, limit = 5) => {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const fetchQuestionsByTopic = async (topic, limit) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('active', true)
    .eq('topic', topic)
    .limit(limit * 3); // fetch extra to shuffle
  if (error) return { data: null, error };
  const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, limit);
  return { data: shuffled, error: null };
};

export const activatePremium = async (userId) => {
  // In production this would be called after payment confirmation
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_premium: true, premium_since: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// AI Explanation via Anthropic API (direct from frontend for demo)
// In production: use Supabase Edge Function to protect the key
export const getAIExplanation = async (question, selectedOption, correctOption, explanation) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `Você é um especialista em Scrum e está ajudando um candidato à certificação PSM I.

Questão: "${question}"

O candidato selecionou a alternativa "${selectedOption}", mas a correta é "${correctOption}".

Explicação base: "${explanation}"

Em 2-3 parágrafos curtos, explique de forma didática e empática:
1. Por que a alternativa escolhida está errada
2. Por que a alternativa correta é a certa, com contexto prático
3. Uma dica rápida para não esquecer esse conceito

Responda em português, de forma clara e encorajadora para o candidato.`,
          },
        ],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || explanation;
  } catch {
    return explanation;
  }
};

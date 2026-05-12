import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore, useTrailExamStore } from '../store';
import { fetchQuestionsByTopic, getAIExplanation } from '../lib/supabase';

const TOPIC_META = {
  framework: { label: 'Framework Scrum', emoji: '⚙️', color: '#00A878' },
  eventos:   { label: 'Eventos',          emoji: '🔄', color: '#3B63F7' },
  papeis:    { label: 'Papéis',           emoji: '👥', color: '#8B5CF6' },
  artefatos: { label: 'Artefatos',        emoji: '📦', color: '#F4A261' },
};

const FREE_LIMIT = 5;
const PREMIUM_LIMIT = 25;

export default function TrailLessonPage() {
  const { topicId } = useParams();
  const { user, profile } = useAuthStore();
  const trailExam = useTrailExamStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const isPremium = profile?.is_premium === true;
  const limit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
  const meta = TOPIC_META[topicId];

  useEffect(() => {
    if (!user || !topicId || !meta) return;

    // If already active for this topic, don't reload
    if (trailExam.status === 'active' && trailExam.topic === topicId) {
      setLoading(false);
      return;
    }

    trailExam.reset();
    fetchQuestionsByTopic(topicId, limit).then(({ data }) => {
      if (!data?.length) {
        navigate('/trilha');
        return;
      }
      trailExam.start(topicId, data, isPremium);
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [topicId, user]);

  if (!meta) { navigate('/trilha'); return null; }
  if (loading) return <LessonLoading meta={meta} />;
  if (trailExam.status === 'finished') return <LessonResult meta={meta} isPremium={isPremium} />;

  return <LessonRunner meta={meta} isPremium={isPremium} />;
}

// ─── Runner ──────────────────────────────────────────────────────────────────
function LessonRunner({ meta, isPremium }) {
  const trailExam = useTrailExamStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const q = trailExam.questions[trailExam.currentIndex];
  const total = trailExam.questions.length;
  const isLast = trailExam.currentIndex === total - 1;
  const alreadyAnswered = q && trailExam.answers[q.id];

  useEffect(() => {
    if (alreadyAnswered) {
      setSelected(alreadyAnswered.selected);
      setConfirmed(true);
    } else {
      setSelected(null);
      setConfirmed(false);
      setAiExplanation('');
    }
  }, [trailExam.currentIndex, alreadyAnswered]);

  const handleConfirm = async () => {
    if (!selected || confirmed) return;
    const isCorrect = selected === q.correct_option;
    trailExam.answer(q.id, selected, isCorrect);
    setConfirmed(true);

    if (!isCorrect) {
      setLoadingAI(true);
      const selText = q.options.find((o) => o.id === selected)?.text || '';
      const corText = q.options.find((o) => o.id === q.correct_option)?.text || '';
      const ai = await getAIExplanation(q.question_text, selText, corText, q.explanation);
      setAiExplanation(ai);
      setLoadingAI(false);
    }
  };

  const handleNext = () => {
    if (isLast) trailExam.finish();
    else trailExam.next();
  };

  if (!q) return null;

  const progress = ((trailExam.currentIndex + (confirmed ? 1 : 0)) / total) * 100;
  const isCorrect = confirmed && selected === q.correct_option;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => { if (window.confirm('Sair da trilha?')) { trailExam.reset(); navigate('/trilha'); } }}
          style={{ color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>{meta.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{meta.label}</span>
            {!isPremium && (
              <span style={{ fontSize: 11, background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                Gratuito
              </span>
            )}
          </div>
          <div style={{ height: 4, background: 'var(--surface-high)', borderRadius: 4 }}>
            <div style={{ height: '100%', borderRadius: 4, background: meta.color, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {trailExam.currentIndex + 1}/{total}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        {/* Difficulty badge */}
        <span style={{
          background: 'var(--surface-low)', color: 'var(--text-muted)',
          fontSize: 11, fontWeight: 700, padding: '3px 10px',
          borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'inline-block', marginBottom: 14,
        }}>
          {q.difficulty}
        </span>

        {/* Question */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.55, marginBottom: 22, animation: 'fadeUp 0.3s ease' }}>
          {q.question_text}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt) => {
            const isSel = selected === opt.id;
            const isCor = opt.id === q.correct_option;
            let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)';
            if (confirmed) {
              if (isCor) { bg = 'var(--success-light)'; border = 'var(--success)'; color = 'var(--success)'; }
              else if (isSel) { bg = 'var(--error-light)'; border = 'var(--error)'; color = 'var(--error)'; }
            } else if (isSel) {
              bg = 'var(--accent-light)'; border = 'var(--accent)'; color = 'var(--accent)';
            }
            return (
              <button key={opt.id} onClick={() => !confirmed && setSelected(opt.id)}
                style={{
                  background: bg, border: `2px solid ${border}`,
                  borderRadius: 12, padding: '13px 14px',
                  textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10,
                  cursor: confirmed ? 'default' : 'pointer',
                  transition: 'all 180ms ease', animation: 'fadeUp 0.3s ease',
                }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: confirmed ? (isCor ? 'var(--success)' : isSel ? 'var(--error)' : 'var(--surface-high)') : (isSel ? 'var(--accent)' : 'var(--surface-high)'),
                  color: (confirmed && (isCor || isSel)) || (!confirmed && isSel) ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, transition: 'all 180ms ease',
                }}>
                  {confirmed && isCor ? '✓' : confirmed && isSel && !isCor ? '✗' : opt.id.toUpperCase()}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color, fontWeight: isSel || (confirmed && isCor) ? 600 : 400, paddingTop: 4 }}>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {confirmed && (
          <div style={{
            borderRadius: 14, padding: '16px',
            background: isCorrect ? 'var(--success-light)' : 'var(--surface)',
            border: `1.5px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`,
            marginBottom: 12, animation: 'fadeUp 0.35s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{isCorrect ? '✅' : '🤖'}</span>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--accent)' }}>
                {isCorrect ? 'Correto! Muito bem!' : 'Explicação com IA'}
              </h4>
            </div>
            {loadingAI ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[100, 85, 70].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 12, width: `${w}%` }} />
                ))}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Analisando com IA...</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {aiExplanation || q.explanation}
                </p>
                {q.scrum_guide_ref && (
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>
                    📖 {q.scrum_guide_ref}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upsell after last free question for non-premium */}
        {!isPremium && confirmed && isLast && (
          <div style={{
            background: 'linear-gradient(135deg,#0D1B2A,#1a3a6e)',
            borderRadius: 14, padding: '18px', marginBottom: 12,
            border: '1px solid rgba(59,99,247,0.3)',
          }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
              🎯 Gostou? Continue aprendendo!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
              Você completou as 5 questões gratuitas desta trilha.
              Faça upgrade para acessar 25 questões por trilha + o Simulado completo de 80 questões.
            </p>
            <button
              onClick={() => navigate('/perfil?upgrade=true')}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              ✨ Ver planos Premium
            </button>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        padding: '14px 16px', background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
      }}>
        {/* Dot progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
          {trailExam.questions.map((q2, i) => {
            const ans = trailExam.answers[q2.id];
            const isCur = i === trailExam.currentIndex;
            return (
              <div key={q2.id} style={{
                width: isCur ? 20 : 8, height: 8, borderRadius: 4,
                background: ans ? (ans.isCorrect ? 'var(--success)' : 'var(--error)') : isCur ? meta.color : 'var(--surface-high)',
                transition: 'all 300ms ease',
              }} />
            );
          })}
        </div>

        {!confirmed ? (
          <button onClick={handleConfirm} disabled={!selected} style={{
            width: '100%', padding: '15px',
            background: selected ? 'var(--primary)' : 'var(--surface-high)',
            color: selected ? '#fff' : 'var(--text-muted)',
            borderRadius: 14, fontSize: 16, fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed', border: 'none',
          }}>
            Confirmar resposta
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            {trailExam.currentIndex > 0 && (
              <button onClick={trailExam.prev} style={{
                flex: 1, padding: '15px', background: 'var(--surface-low)',
                border: '1.5px solid var(--border)', borderRadius: 14,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', color: 'var(--text)',
              }}>← Anterior</button>
            )}
            <button onClick={handleNext} style={{
              flex: 2, padding: '15px',
              background: isLast ? 'var(--success)' : 'var(--primary)',
              color: '#fff', borderRadius: 14, fontSize: 16,
              fontWeight: 700, cursor: 'pointer', border: 'none',
            }}>
              {isLast ? '✓ Ver resultado' : 'Próxima →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────────────────
function LessonResult({ meta, isPremium }) {
  const trailExam = useTrailExamStore();
  const navigate = useNavigate();
  const { result, questions, answers } = trailExam;
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const target = result?.score || 0;
    let cur = 0;
    const iv = setInterval(() => {
      cur += 2;
      if (cur >= target) { setAnimScore(target); clearInterval(iv); }
      else setAnimScore(cur);
    }, 20);
    return () => clearInterval(iv);
  }, [result]);

  const passed = (result?.score || 0) >= 70;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 40 }}>
      {/* Hero */}
      <div style={{
        background: passed ? 'linear-gradient(135deg,#00A878,#007a58)' : 'linear-gradient(135deg,#1a1a2e,#16213e)',
        padding: '60px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{meta.emoji}</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 4 }}>
            {animScore}%
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            {passed ? 'Parabéns! 🎉' : 'Continue praticando!'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {meta.label} — {result?.correct}/{result?.total} corretas
          </p>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--success)' }}>{result?.correct}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Corretas</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>❌</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--error)' }}>{(result?.total || 0) - (result?.correct || 0)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Erradas</div>
          </div>
        </div>

        {/* Answer review */}
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: '18px', border: '1px solid var(--border)', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>📋 Revisão das respostas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {questions.map((q, i) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 8,
                  background: ans?.isCorrect ? 'var(--success-light)' : 'var(--error-light)',
                  border: `1px solid ${ans?.isCorrect ? '#c8ede3' : '#f9d4d6'}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{ans?.isCorrect ? '✅' : '❌'}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                      {i+1}. {q.question_text.slice(0,80)}{q.question_text.length > 80 ? '…' : ''}
                    </p>
                    {!ans?.isCorrect && (
                      <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                        Correta: {q.options.find(o => o.id === q.correct_option)?.text?.slice(0,60)}…
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium upsell for free users */}
        {!isPremium && (
          <div onClick={() => navigate('/perfil?upgrade=true')} style={{
            background: 'linear-gradient(135deg,#0D1B2A,#1a3a6e)', borderRadius: 14,
            padding: '18px', marginBottom: 16, cursor: 'pointer',
            border: '1px solid rgba(59,99,247,0.3)',
          }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 6 }}>✨ Quer mais questões?</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
              Você usou suas 5 questões gratuitas. Premium desbloqueia 25 questões por trilha e o Simulado completo de 80 questões.
            </p>
            <div style={{ marginTop: 12, display: 'inline-block', background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>
              Ver planos →
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { trailExam.reset(); navigate(`/trilha/${trailExam.topic || ''}`); }}
            style={{ width: '100%', padding: '15px', background: 'var(--primary)', color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            🔄 Refazer trilha
          </button>
          <button onClick={() => { trailExam.reset(); navigate('/trilha'); }}
            style={{ width: '100%', padding: '15px', background: 'var(--surface)', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            ← Voltar às trilhas
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LessonLoading({ meta }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <div style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
        {meta.emoji}
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Carregando {meta.label}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Preparando suas questões...</p>
      </div>
      <div style={{ width: 160, height: 4, background: 'var(--surface-high)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', background: meta.color, borderRadius: 4, animation: 'shimmer 1.2s ease infinite' }} />
      </div>
    </div>
  );
}

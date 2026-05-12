import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useExamStore } from '../store';
import {
  fetchRandomQuestions, createExamSession,
  saveExamAnswer, finishExamSession, getAIExplanation,
} from '../lib/supabase';

const EXAM_QUESTIONS = 80;
const EXAM_SECONDS  = 60 * 60; // 60 min

export default function ExamPage() {
  const { user, profile } = useAuthStore();
  const exam = useExamStore();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const isPremium = profile?.is_premium === true;

  const start = async () => {
    setStarting(true);
    const { data: questions } = await fetchRandomQuestions(EXAM_QUESTIONS);
    if (!questions?.length) { setStarting(false); return; }
    const { data: session } = await createExamSession(user.id, questions.length);
    exam.startExam(questions, session?.id);
    setStarting(false);
  };

  useEffect(() => {
    if (exam.status === 'idle') start();
    // eslint-disable-next-line
  }, []);

  // Paywall screen
  if (!isPremium) return <PaywallScreen />;

  if (starting || exam.status === 'idle') return <LoadingExam />;
  if (exam.status === 'finished') { navigate('/resultado'); return null; }
  return <ExamRunner />;
}

// ─── Paywall ─────────────────────────────────────────────────────────────────
function PaywallScreen() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#0D1B2A 0%,#1a3a6e 100%)',
        padding: '60px 24px 40px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(59,99,247,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,168,120,0.15)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Simulado Completo PSM I
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
            O simulado real com 80 questões e 60 minutos está disponível somente para assinantes Premium.
          </p>
        </div>
      </div>

      <div style={{ padding: '24px 20px', flex: 1 }}>
        {/* Exam specs */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>📋 O que está incluído</h3>
          {[
            ['🎯', '80 questões', 'Distribuídas por todos os tópicos do PSM I'],
            ['⏱️', '60 minutos', 'Mesmo tempo-limite do exame oficial'],
            ['🤖', 'Feedback IA', 'Explicação inteligente em cada erro'],
            ['📊', 'Análise completa', 'Breakdown por tópico ao final'],
            ['🔄', 'Ilimitado', 'Refaça quantas vezes quiser'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compare free vs premium */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Gratuito vs Premium</h3>
          {[
            ['Trilhas de aprendizado', '✅', '✅'],
            ['Questões por trilha', '5', '25'],
            ['Feedback com IA', '✅', '✅'],
            ['Simulado completo (80q)', '🔒', '✅'],
            ['Histórico ilimitado', '🔒', '✅'],
          ].map(([feat, free, prem]) => (
            <div key={feat} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              gap: 12, alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{feat}</span>
              <span style={{ fontSize: 13, color: free === '🔒' ? 'var(--text-muted)' : 'var(--success)', fontWeight: 600, textAlign: 'center', minWidth: 40 }}>{free}</span>
              <span style={{ fontSize: 13, color: prem === '🔒' ? 'var(--text-muted)' : 'var(--success)', fontWeight: 600, textAlign: 'center', minWidth: 40 }}>{prem}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/perfil?upgrade=true')}
          style={{
            width: '100%', padding: '18px',
            background: 'linear-gradient(135deg,#3B63F7,#2248d0)',
            color: '#fff', borderRadius: 16, fontSize: 17, fontWeight: 800,
            border: 'none', cursor: 'pointer', marginBottom: 12,
            boxShadow: '0 4px 20px rgba(59,99,247,0.35)',
          }}
        >
          ✨ Fazer upgrade para Premium
        </button>
        <button
          onClick={() => navigate('/trilha')}
          style={{
            width: '100%', padding: '14px',
            background: 'var(--surface)', color: 'var(--text)',
            border: '1.5px solid var(--border)', borderRadius: 14,
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Continuar nas trilhas gratuitas
        </button>
      </div>
    </div>
  );
}

// ─── Exam Runner ─────────────────────────────────────────────────────────────
function ExamRunner() {
  const { user } = useAuthStore();
  const exam = useExamStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);

  const q = exam.questions[exam.currentIndex];
  const total = exam.questions.length;
  const isLast = exam.currentIndex === total - 1;
  const alreadyAnswered = q && exam.answers[q.id];

  useEffect(() => {
    const iv = setInterval(() => {
      const elapsed = exam.getElapsedSeconds();
      const rem = Math.max(0, EXAM_SECONDS - elapsed);
      setTimeLeft(rem);
      if (rem === 0) handleFinish();
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (alreadyAnswered) {
      setSelected(alreadyAnswered.selected);
      setConfirmed(true);
      setAiExplanation('');
    } else {
      setSelected(null);
      setConfirmed(false);
      setAiExplanation('');
    }
  }, [exam.currentIndex, alreadyAnswered]);

  const handleConfirm = async () => {
    if (!selected || confirmed) return;
    const isCorrect = selected === q.correct_option;
    const timeSpent = Math.floor((Date.now() - exam.questionStartTime) / 1000);
    exam.answerQuestion(q.id, selected, isCorrect);
    setConfirmed(true);
    await saveExamAnswer(exam.sessionId, user.id, q.id, selected, isCorrect, timeSpent);
    if (!isCorrect) {
      setLoadingAI(true);
      const selText = q.options.find(o => o.id === selected)?.text || '';
      const corText = q.options.find(o => o.id === q.correct_option)?.text || '';
      const ai = await getAIExplanation(q.question_text, selText, corText, q.explanation);
      setAiExplanation(ai);
      setLoadingAI(false);
    }
  };

  const handleFinish = useCallback(async () => {
    const answers = Object.values(exam.answers);
    const correct = answers.filter(a => a.isCorrect).length;
    const elapsed = exam.getElapsedSeconds();
    const { data } = await finishExamSession(exam.sessionId, correct, exam.questions.length, elapsed);
    exam.finishExam(data || { correct_answers: correct, total_questions: exam.questions.length, score: Math.round((correct/exam.questions.length)*100), duration_seconds: elapsed });
    navigate('/resultado');
  }, [exam, navigate]);

  if (!q) return null;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2,'0');
  const seconds = String(timeLeft % 60).padStart(2,'0');
  const progress = ((exam.currentIndex + (confirmed ? 1 : 0)) / total) * 100;
  const isCorrect = confirmed && selected === q.correct_option;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => { if (window.confirm('Abandonar o simulado?')) { exam.reset(); navigate('/'); } }}
          style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Sair
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>⏱</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: timeLeft < 300 ? 'var(--error)' : 'var(--text)' }}>
            {minutes}:{seconds}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{exam.currentIndex+1}/{total}</span>
      </div>
      <div style={{ height: 3, background: 'var(--surface-high)' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
        <span style={{
          background: 'var(--accent-light)', color: 'var(--accent)',
          fontSize: 11, fontWeight: 700, padding: '3px 10px',
          borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'inline-block', marginBottom: 14,
        }}>{q.topic}</span>

        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.55, marginBottom: 22, animation: 'fadeUp 0.3s ease' }}>
          {q.question_text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt) => {
            const isSel = selected === opt.id;
            const isCor = opt.id === q.correct_option;
            let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--text)';
            if (confirmed) {
              if (isCor) { bg='var(--success-light)'; border='var(--success)'; color='var(--success)'; }
              else if (isSel) { bg='var(--error-light)'; border='var(--error)'; color='var(--error)'; }
            } else if (isSel) { bg='var(--accent-light)'; border='var(--accent)'; color='var(--accent)'; }
            return (
              <button key={opt.id} onClick={() => !confirmed && setSelected(opt.id)}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '13px 14px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10, cursor: confirmed ? 'default' : 'pointer', transition: 'all 180ms ease' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: confirmed ? (isCor ? 'var(--success)' : isSel ? 'var(--error)' : 'var(--surface-high)') : (isSel ? 'var(--accent)' : 'var(--surface-high)'), color: (confirmed && (isCor||isSel)) || (!confirmed && isSel) ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                  {confirmed && isCor ? '✓' : confirmed && isSel && !isCor ? '✗' : opt.id.toUpperCase()}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color, fontWeight: isSel||(confirmed&&isCor) ? 600 : 400, paddingTop: 4 }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {confirmed && (
          <div style={{ borderRadius: 14, padding: '16px', background: isCorrect ? 'var(--success-light)' : 'var(--surface)', border: `1.5px solid ${isCorrect ? 'var(--success)' : 'var(--border)'}`, marginBottom: 12, animation: 'fadeUp 0.35s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{isCorrect ? '✅' : '🤖'}</span>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--accent)' }}>
                {isCorrect ? 'Correto!' : 'Explicação com IA'}
              </h4>
            </div>
            {loadingAI ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[100,85,70].map((w,i) => <div key={i} className="skeleton" style={{ height: 12, width: `${w}%` }} />)}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {aiExplanation || q.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ padding: '14px 16px', background: 'var(--surface)', borderTop: '1px solid var(--border)', paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 12, flexWrap: 'wrap' }}>
          {exam.questions.map((q2, i) => {
            const ans = exam.answers[q2.id];
            const isCur = i === exam.currentIndex;
            return <div key={q2.id} style={{ width: isCur ? 16 : 6, height: 6, borderRadius: 3, background: ans ? (ans.isCorrect ? 'var(--success)' : 'var(--error)') : isCur ? 'var(--accent)' : 'var(--surface-high)', transition: 'all 300ms ease' }} />;
          })}
        </div>
        {!confirmed ? (
          <button onClick={handleConfirm} disabled={!selected} style={{ width: '100%', padding: '15px', background: selected ? 'var(--primary)' : 'var(--surface-high)', color: selected ? '#fff' : 'var(--text-muted)', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed', border: 'none' }}>
            Confirmar resposta
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            {exam.currentIndex > 0 && (
              <button onClick={exam.prevQuestion} style={{ flex: 1, padding: '15px', background: 'var(--surface-low)', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', color: 'var(--text)' }}>← Ant.</button>
            )}
            <button onClick={() => isLast ? handleFinish() : exam.nextQuestion()} style={{ flex: 2, padding: '15px', background: isLast ? 'var(--success)' : 'var(--primary)', color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', border: 'none' }}>
              {isLast ? '✓ Finalizar' : 'Próxima →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingExam() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
      <div style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎯</div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Preparando Simulado</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>80 questões selecionadas aleatoriamente...</p>
      </div>
      <div style={{ width: 200, height: 4, background: 'var(--surface-high)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', background: 'var(--accent)', borderRadius: 4, animation: 'shimmer 1.2s ease infinite' }} />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamStore } from '../store';

const PASS_SCORE = 85;

export default function ResultPage() {
  const exam = useExamStore();
  const navigate = useNavigate();
  const [animateScore, setAnimateScore] = useState(0);

  const result = exam.result;
  const answers = exam.answers;
  const questions = exam.questions;

  const correct = Object.values(answers).filter((a) => a.isCorrect).length;
  const total = questions.length || result?.total_questions || 0;
  const score = total > 0 ? Math.round((correct / total) * 100) : result?.score || 0;
  const passed = score >= PASS_SCORE;
  const durationMin = result?.duration_seconds ? Math.floor(result.duration_seconds / 60) : 0;
  const durationSec = result?.duration_seconds ? result.duration_seconds % 60 : 0;

  // Animate score counter
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= score) {
          setAnimateScore(score);
          clearInterval(interval);
        } else {
          setAnimateScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    }, 400);
    return () => clearTimeout(timer);
  }, [score]);

  // Topic breakdown
  const topicBreakdown = {};
  questions.forEach((q) => {
    if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 };
    topicBreakdown[q.topic].total++;
    if (answers[q.id]?.isCorrect) topicBreakdown[q.topic].correct++;
  });

  const TOPIC_LABELS = {
    framework: 'Framework Scrum',
    eventos: 'Eventos',
    papeis: 'Papéis',
    artefatos: 'Artefatos',
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '0 0 40px' }}>
      {/* Hero result */}
      <div style={{
        background: passed ? 'linear-gradient(135deg, #00A878, #007a58)' : 'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding: '60px 24px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, right: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {passed ? '🏆' : '📚'}
          </div>

          <div style={{
            fontSize: 72, fontWeight: 900, color: '#fff',
            lineHeight: 1, letterSpacing: '-0.03em',
            marginBottom: 4,
          }}>
            {animateScore}%
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {passed ? 'Aprovado! Parabéns! 🎉' : 'Continue praticando!'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 280, margin: '0 auto' }}>
            {passed
              ? 'Você atingiu a pontuação mínima para aprovação no PSM I.'
              : `Você precisa de ${PASS_SCORE}% para aprovação. Faltaram ${PASS_SCORE - score}%.`}
          </p>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          <MiniStat label="Corretas" value={correct} emoji="✅" color="var(--success)" />
          <MiniStat label="Erradas" value={total - correct} emoji="❌" color="var(--error)" />
          <MiniStat label="Tempo" value={`${durationMin}m${String(durationSec).padStart(2,'0')}s`} emoji="⏱" color="var(--accent)" />
        </div>

        {/* Score vs passing */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          padding: '20px', border: '1px solid var(--border)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
            📊 Desempenho por Tópico
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(topicBreakdown).map(([topic, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {TOPIC_LABELS[topic] || topic}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)',
                    }}>
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-high)', borderRadius: 4 }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: `${pct}%`,
                      background: pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question review */}
        {questions.length > 0 && (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            padding: '20px', border: '1px solid var(--border)', marginBottom: 24,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
              📋 Resumo das Respostas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.map((q, i) => {
                const ans = answers[q.id];
                const isCorrect = ans?.isCorrect;
                return (
                  <div key={q.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px',
                    background: isCorrect ? 'var(--success-light)' : 'var(--error-light)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isCorrect ? '#c8ede3' : '#f9d4d6'}`,
                  }}>
                    <span style={{
                      fontSize: 16, flexShrink: 0, lineHeight: 1.5,
                    }}>
                      {isCorrect ? '✅' : '❌'}
                    </span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                        {i + 1}. {q.question_text.slice(0, 80)}
                        {q.question_text.length > 80 ? '...' : ''}
                      </p>
                      {!isCorrect && (
                        <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                          Resposta correta: {q.options.find((o) => o.id === q.correct_option)?.text?.slice(0, 60)}...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => {
              exam.reset();
              navigate('/simulado');
            }}
            style={{
              width: '100%', padding: '16px',
              background: 'var(--primary)', color: '#fff',
              borderRadius: 'var(--radius-lg)',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
          >
            🔄 Novo Simulado
          </button>
          <button
            onClick={() => {
              exam.reset();
              navigate('/');
            }}
            style={{
              width: '100%', padding: '16px',
              background: 'var(--surface)', color: 'var(--text)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, emoji, color }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      padding: '14px 10px', textAlign: 'center',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

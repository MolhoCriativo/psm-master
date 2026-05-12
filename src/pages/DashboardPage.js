import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import {
  fetchUserStats,
  fetchTopicPerformance,
  fetchRecentExams,
} from '../lib/supabase';

const TOPIC_LABELS = {
  framework: 'Framework Scrum',
  eventos: 'Eventos',
  papeis: 'Papéis',
  artefatos: 'Artefatos',
};

const TOPIC_ICONS = {
  framework: '⚙️',
  eventos: '🔄',
  papeis: '👥',
  artefatos: '📦',
};

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topicPerf, setTopicPerf] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [s, t, r] = await Promise.all([
        fetchUserStats(user.id),
        fetchTopicPerformance(user.id),
        fetchRecentExams(user.id),
      ]);
      setStats(s.data);
      setTopicPerf(t.data || []);
      setRecentExams(r.data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const weakTopics = topicPerf
    .filter((t) => t.total_answered > 0 && t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2);

  const masteryScore = stats?.mastery_score || stats?.average_score || 0;

  const firstName = profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] || 'Estudante';

  if (loading) return <DashboardSkeleton />;

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)',
        padding: '52px 20px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>
          Bem-vindo de volta 👋
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {firstName}
        </h1>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Mastery Card */}
        <div style={{
          background: 'var(--primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeUp 0.4s ease',
        }}>
          {/* BG decoration */}
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 120, height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: 40,
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'rgba(59,99,247,0.3)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Maestria PSM I
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
              <RadialGauge value={masteryScore} />
              <div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                  Média dos simulados
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {Math.round(stats?.average_score || 0)}
                  <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 4, opacity: 0.7 }}>pts</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  {stats?.total_exams || 0} simulados realizados
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, height: 6, marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${Math.min(masteryScore, 100)}%`,
                background: 'linear-gradient(90deg, #3B63F7, #00A878)',
                transition: 'width 1s ease',
              }} />
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Meta de aprovação: 85 pontos
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <StatCard
            label="Questões respondidas"
            value={stats?.total_questions_answered || 0}
            icon="📝"
            color="var(--accent)"
          />
          <StatCard
            label="Taxa de acerto"
            value={stats?.total_questions_answered
              ? `${Math.round((stats.total_correct / stats.total_questions_answered) * 100)}%`
              : '—'}
            icon="🎯"
            color="var(--success)"
          />
        </div>

        {/* Weak areas */}
        {weakTopics.length > 0 && (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: 20,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                ⚠️ Áreas de Foco
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Prioridade de estudo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weakTopics.map((t) => (
                <div key={t.topic} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface-low)', borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{TOPIC_ICONS[t.topic]}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                      {TOPIC_LABELS[t.topic]}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: t.accuracy < 50 ? 'var(--error)' : 'var(--warning)',
                    background: t.accuracy < 50 ? 'var(--error-light)' : 'var(--warning-light)',
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                  }}>
                    {Math.round(t.accuracy)}% acertos
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent exams */}
        {recentExams.length > 0 && (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: 20,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
              📊 Histórico Recente
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentExams.map((exam) => (
                <div key={exam.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      Simulado — {exam.total_questions} questões
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(exam.finished_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 800,
                    color: exam.score >= 85 ? 'var(--success)' : exam.score >= 60 ? 'var(--accent)' : 'var(--error)',
                  }}>
                    {Math.round(exam.score)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('/simulado')}
          className="pressable"
          style={{
            width: '100%',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            fontSize: 17,
            fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10,
            boxShadow: 'var(--shadow-lg)',
            letterSpacing: '0.01em',
          }}
        >
          <span style={{ fontSize: 20 }}>🚀</span>
          Iniciar Novo Simulado
        </button>

        <p style={{
          textAlign: 'center', marginTop: 10,
          fontSize: 13, color: 'var(--text-muted)',
        }}>
          20 questões • Modo adaptativo
        </p>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <QuickAction emoji="📚" label="Trilha de aprendizado" onClick={() => navigate('/trilha')} accent />
          <QuickAction emoji="🧠" label="Revisão inteligente" onClick={() => navigate('/simulado?mode=review')} />
        </div>

      </div>
    </div>
  );
}

function RadialGauge({ value }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;

  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B63F7" />
            <stop offset="100%" stopColor="#00A878" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  );
}

function QuickAction({ emoji, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className="pressable"
      style={{
        background: accent ? 'var(--accent-light)' : 'var(--surface)',
        border: `1.5px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'all 200ms ease',
      }}
    >
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: accent ? 'var(--accent)' : 'var(--text)',
        lineHeight: 1.3,
      }}>
        {label}
      </span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: '52px 20px 24px' }}>
      <div className="skeleton" style={{ height: 20, width: 120, marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 28 }} />
      <div className="skeleton" style={{ height: 180, borderRadius: 24, marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
      </div>
      <div className="skeleton" style={{ height: 56, borderRadius: 16 }} />
    </div>
  );
}

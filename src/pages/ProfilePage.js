import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store';
import { fetchUserStats, fetchTopicPerformance, fetchRecentExams, signOut, activatePremium } from '../lib/supabase';

const TOPIC_LABELS = {
  framework: 'Framework Scrum',
  eventos: 'Eventos',
  papeis: 'Papéis',
  artefatos: 'Artefatos',
};

export default function ProfilePage() {
  const { user, profile, clear, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [topicPerf, setTopicPerf] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(searchParams.get('upgrade') === 'true');
  const [activating, setActivating] = useState(false);

  const isPremium = profile?.is_premium === true;

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchUserStats(user.id),
      fetchTopicPerformance(user.id),
      fetchRecentExams(user.id, 10),
    ]).then(([s, t, r]) => {
      setStats(s.data);
      setTopicPerf(t.data || []);
      setRecentExams(r.data || []);
      setLoading(false);
    });
  }, [user]);

  const handleActivatePremium = async () => {
    setActivating(true);
    const { data } = await activatePremium(user.id);
    if (data) {
      setProfile(data);
      setShowUpgrade(false);
    }
    setActivating(false);
  };

  const handleSignOut = async () => {
    await signOut();
    clear();
    navigate('/auth');
  };

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário';
  const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const email = user?.email || '';

  if (loading) return (
    <div style={{ padding: '52px 20px 24px' }}>
      <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 24, width: 160, marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: 200 }} />
    </div>
  );

  const bestScore = recentExams.length
    ? Math.max(...recentExams.map((e) => e.score))
    : 0;

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)',
        padding: '52px 20px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(59,99,247,0.2)',
        }} />

        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff',
          margin: '0 auto 14px',
          border: '3px solid rgba(255,255,255,0.2)',
        }}>
          {initials}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          {fullName}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{email}</p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)',
          padding: '6px 14px', marginTop: 12,
        }}>
          <span style={{ fontSize: 14 }}>🎓</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            Candidato PSM I
          </span>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Achievement stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <BigStat label="Simulados" value={stats?.total_exams || 0} emoji="📝" />
          <BigStat label="Melhor nota" value={`${Math.round(bestScore)}%`} emoji="🏆" />
          <BigStat label="Questões" value={stats?.total_questions_answered || 0} emoji="❓" />
          <BigStat label="Taxa de acerto" value={
            stats?.total_questions_answered
              ? `${Math.round((stats.total_correct / stats.total_questions_answered) * 100)}%`
              : '—'
          } emoji="🎯" />
        </div>

        {/* Topic performance */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          padding: '20px', border: '1px solid var(--border)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📊 Performance por Tópico</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topicPerf.map((t) => {
              const pct = t.total_answered > 0 ? Math.round(t.accuracy) : null;
              return (
                <div key={t.topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {TOPIC_LABELS[t.topic]}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: pct === null ? 'var(--text-muted)'
                        : pct >= 70 ? 'var(--success)'
                        : pct >= 50 ? 'var(--warning)'
                        : 'var(--error)',
                    }}>
                      {pct === null ? 'Não praticado' : `${pct}% (${t.total_answered} questões)`}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-high)', borderRadius: 4 }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      width: pct !== null ? `${pct}%` : '0%',
                      background: pct === null ? 'transparent'
                        : pct >= 70 ? 'var(--success)'
                        : pct >= 50 ? 'var(--warning)'
                        : 'var(--error)',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam history */}
        {recentExams.length > 0 && (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
            padding: '20px', border: '1px solid var(--border)', marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🕐 Histórico de Simulados</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentExams.map((exam, i) => (
                <div key={exam.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < recentExams.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      Simulado #{i + 1}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(exam.finished_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })} • {exam.total_questions} questões
                      {exam.duration_seconds && ` • ${Math.floor(exam.duration_seconds / 60)}min`}
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

        {/* Premium status / upsell */}
        {isPremium ? (
          <div style={{
            background: 'linear-gradient(135deg,#00A878,#007a58)',
            borderRadius: 16, padding: '18px 20px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 32 }}>✨</span>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Você é Premium!</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>25 questões por trilha + Simulado completo desbloqueados.</p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowUpgrade(true)}
            style={{
              background: 'linear-gradient(135deg,#0D1B2A,#1a3a6e)',
              borderRadius: 16, padding: '18px 20px', marginBottom: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid rgba(59,99,247,0.3)',
            }}
          >
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 2 }}>✨ Fazer upgrade para Premium</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Desbloqueie 25 questões + Simulado completo</p>
            </div>
            <span style={{ color: 'var(--accent)', fontSize: 20 }}>→</span>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '16px',
            background: 'var(--error-light)', color: 'var(--error)',
            border: '1.5px solid var(--error)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Sair da conta
        </button>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && !isPremium && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }} onClick={(e) => e.target === e.currentTarget && setShowUpgrade(false)}>
          <div style={{
            background: 'var(--surface)', borderRadius: '24px 24px 0 0',
            padding: '28px 24px 40px', width: '100%', maxWidth: 480,
            animation: 'slideUp 0.35s ease',
            maxHeight: '90dvh', overflowY: 'auto',
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>✨</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                PSM Master Premium
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.5 }}>
                Acesso completo a todas as questões e ao simulado oficial.
              </p>
            </div>

            {/* Features */}
            <div style={{ background: 'var(--surface-low)', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
              {[
                ['❓', '25 questões por trilha', 'vs 5 no plano gratuito'],
                ['🎯', 'Simulado completo — 80 questões', '60 minutos, formato oficial PSM I'],
                ['🤖', 'Feedback IA ilimitado', 'Explicações em todos os erros'],
                ['📊', 'Analytics completo', 'Performance detalhada por tópico'],
                ['🔄', 'Simulados ilimitados', 'Refaça quantas vezes quiser'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: 16, flexShrink: 0 }}>✓</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em' }}>
                R$ 49<span style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-muted)' }}>,90</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pagamento único · Acesso vitalício</p>
            </div>

            {/* CTA — in production connect to Stripe/Pix here */}
            <button
              onClick={handleActivatePremium}
              disabled={activating}
              style={{
                width: '100%', padding: '17px',
                background: activating ? 'var(--text-muted)' : 'linear-gradient(135deg,#3B63F7,#2248d0)',
                color: '#fff', borderRadius: 14, fontSize: 17, fontWeight: 800,
                border: 'none', cursor: activating ? 'not-allowed' : 'pointer',
                marginBottom: 10, boxShadow: '0 4px 20px rgba(59,99,247,0.3)',
              }}
            >
              {activating ? 'Ativando...' : '🚀 Ativar Premium agora'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              ⚡ Ativação instantânea · Sem assinatura recorrente
            </p>
            <button onClick={() => setShowUpgrade(false)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BigStat({ label, value, emoji }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
      padding: '18px', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { fetchTrailProgress } from '../lib/supabase';

const TOPICS = [
  {
    id: 'framework',
    label: 'Framework Scrum',
    subtitle: 'Fundamentos e Teoria',
    emoji: '⚙️',
    color: '#00A878',
    colorLight: '#E6F7F3',
    totalLessons: 10,
    description: 'Domine os pilares, valores e teoria por trás do Scrum.',
  },
  {
    id: 'eventos',
    label: 'Eventos',
    subtitle: 'As 5 Oportunidades Formais',
    emoji: '🔄',
    color: '#3B63F7',
    colorLight: '#EEF2FF',
    totalLessons: 5,
    description: 'Entenda Sprint, Planning, Daily, Review e Retrospective.',
  },
  {
    id: 'papeis',
    label: 'Papéis',
    subtitle: 'Responsabilidades do Time Scrum',
    emoji: '👥',
    color: '#8B5CF6',
    colorLight: '#F0EBFF',
    totalLessons: 3,
    description: 'Product Owner, Scrum Master e Developers em profundidade.',
  },
  {
    id: 'artefatos',
    label: 'Artefatos',
    subtitle: 'Backlogs e Incrementos',
    emoji: '📦',
    color: '#F4A261',
    colorLight: '#FEF4EB',
    totalLessons: 3,
    description: 'Product Backlog, Sprint Backlog, Incremento e compromissos.',
  },
];

const DAILY_TIPS = [
  'O Scrum Master serve ao Product Owner auxiliando na busca por técnicas para a definição eficaz da Meta do Produto.',
  'A Sprint tem duração máxima de um mês. Sprints mais curtas criam mais oportunidades de inspeção e adaptação.',
  'O Product Backlog é um artefato vivo — o Product Owner é o único responsável por seu conteúdo e ordenação.',
  'A Daily Scrum é um evento de 15 minutos dos Developers. O Scrum Master não precisa estar presente.',
  'O Incremento deve atender à Definição de Pronto independente da decisão de release.',
];

export default function TrailPage() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip] = useState(() => DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)]);
  const isPremium = profile?.is_premium === true;

  useEffect(() => {
    if (!user) return;
    fetchTrailProgress(user.id).then(({ data }) => {
      setProgress(data || []);
      setLoading(false);
    });
  }, [user]);

  const getTopicProgress = (topicId) => progress.find((p) => p.topic === topicId);
  const totalLessons = TOPICS.reduce((s, t) => s + t.totalLessons, 0);
  const completedLessons = progress.reduce((s, p) => s + (p.lessons_completed || 0), 0);
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (loading) return <TrailSkeleton />;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Hero */}
      <div style={{
        background: 'var(--primary)', padding: '52px 20px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(59,99,247,0.25)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ background: '#00A878', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Trilha de Aprendizado
            </span>
            {isPremium && (
              <span style={{ background: 'linear-gradient(135deg,#F4A261,#E76F51)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>
                ✨ Premium
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Certificação PSM I</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 20 }}>
            {isPremium ? '25 questões por trilha desbloqueadas' : '5 questões gratuitas por trilha · Upgrade para 25'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{completedLessons}/{totalLessons} lições</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{overallPct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, height: 8 }}>
            <div style={{ height: '100%', borderRadius: 4, width: `${overallPct}%`, background: 'linear-gradient(90deg,#3B63F7,#00A878)', transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Premium upsell banner */}
        {!isPremium && (
          <div onClick={() => navigate('/perfil?upgrade=true')} style={{
            background: 'linear-gradient(135deg,#0D1B2A,#1a3a6e)', borderRadius: 16,
            padding: '18px 20px', marginBottom: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid rgba(59,99,247,0.3)',
          }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>✨ Desbloqueie todas as questões</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>5 → 25 questões por trilha + Simulado completo</p>
            </div>
            <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 12 }}>
              Ver planos →
            </div>
          </div>
        )}

        {/* Topic cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {TOPICS.map((topic, i) => {
            const prog = getTopicProgress(topic.id);
            const lessonsCompleted = prog?.lessons_completed ?? 0;
            const questionsLimit = isPremium ? (prog?.premium_questions_limit ?? 25) : (prog?.free_questions_limit ?? 5);
            const isCompleted = prog?.completed ?? false;
            const pct = Math.round((lessonsCompleted / topic.totalLessons) * 100);
            return (
              <TopicCard key={topic.id} topic={topic} isPremium={isPremium}
                lessonsCompleted={lessonsCompleted} questionsLimit={questionsLimit}
                isCompleted={isCompleted} pct={pct} index={i}
                onClick={() => navigate(`/trilha/${topic.id}`)} />
            );
          })}
        </div>

        {/* Tip */}
        <div style={{ background: 'var(--accent-light)', borderRadius: 16, padding: '20px', marginTop: 24, border: '1px solid rgba(59,99,247,0.15)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>💡</span>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Dica do dia</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ topic, isPremium, lessonsCompleted, questionsLimit, isCompleted, pct, index, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)', borderRadius: 16,
      border: `1.5px solid ${isCompleted ? topic.color : 'var(--border)'}`,
      padding: '18px', cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
      animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
      transition: 'transform 150ms ease, box-shadow 150ms ease',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: topic.colorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {topic.emoji}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{topic.label}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{topic.subtitle}</p>
          </div>
        </div>
        {isCompleted
          ? <span style={{ fontSize: 12, fontWeight: 700, background: '#E6F7F3', color: '#00A878', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>✓ Concluído</span>
          : <span style={{ fontSize: 20, color: 'var(--text-muted)' }}>→</span>
        }
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{topic.description}</p>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--surface-high)', borderRadius: 4 }}>
          <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: isCompleted ? '#00A878' : topic.color, transition: 'width 0.8s ease' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{lessonsCompleted}/{topic.totalLessons}</span>
      </div>

      {/* Questions pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-low)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>❓</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{questionsLimit} questões disponíveis</span>
        </div>
        {isPremium
          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#00A878' }}>✨ Premium</span>
          : <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>5 de 25 grátis</span>
        }
      </div>
    </div>
  );
}

function TrailSkeleton() {
  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '52px 20px 28px' }}>
        <div className="skeleton" style={{ height: 22, width: 140, marginBottom: 10, background: 'rgba(255,255,255,0.1)' }} />
        <div className="skeleton" style={{ height: 32, width: 220, background: 'rgba(255,255,255,0.1)' }} />
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
      </div>
    </div>
  );
}

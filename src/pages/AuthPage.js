import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signInWithProvider, signUp } from '../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSSO = async (provider) => {
    setError('');
    setLoading(true);
    const { error } = await signInWithProvider(provider);
    setLoading(false);
    if (error) {
      setError('Não foi possível autenticar com ' + (provider === 'apple' ? 'Apple' : 'Google') + '. Tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError('Email ou senha inválidos. Tente novamente.');
      } else {
        navigate('/');
      }
    } else {
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError('Erro ao criar conta. Tente com outro email.');
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar.');
        setMode('login');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'grid', gap: 24 }}>
        <div style={{ textAlign: 'center', color: '#0F172A' }}>
          <div style={{
            width: 90,
            height: 90,
            margin: '0 auto 18px',
            borderRadius: 28,
            background: 'rgba(59,99,247,0.08)',
            display: 'grid',
            placeItems: 'center',
          }}>
            <img src="/logo-fav.svg" alt="PSM Master" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900, lineHeight: 1.05 }}>
            PSM Master
          </h1>
          <p style={{ margin: '12px auto 0', maxWidth: 320, color: '#475569', fontSize: 15, lineHeight: 1.7 }}>
            Prepare-se para a certificação PSM I com trilhas, simulados e feedback inteligente.
          </p>
        </div>

        <div style={{
          width: '100%',
          background: '#fff',
          borderRadius: 32,
          padding: '32px 28px',
          boxShadow: '0 30px 80px rgba(15,23,42,0.08)',
          border: '1px solid rgba(15,23,42,0.08)',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: '#F8FAFC', borderRadius: 999, padding: 4 }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 999,
                  border: 'none',
                  background: mode === m ? '#FFFFFF' : 'transparent',
                  color: mode === m ? '#0F172A' : '#64748B',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mode === 'signup' && (
              <Field
                label="Nome completo"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Seu nome"
                required
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              required
            />
            <Field
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
              required
            />

            {error && (
              <div style={{
                background: '#FEE2E2',
                color: '#B91C1C',
                borderRadius: 18,
                padding: '12px 14px',
                fontSize: 14,
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: '#ECFDF5',
                color: '#0F5132',
                borderRadius: 18,
                padding: '12px 14px',
                fontSize: 14,
                fontWeight: 500,
              }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#CBD5E1' : '#3B82F6',
                color: '#fff',
                borderRadius: 18,
                padding: '14px',
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 200ms ease',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Ou continue com
              </span>
              <span style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => handleSSO('google')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px',
                  borderRadius: 18,
                  border: '1px solid #E2E8F0',
                  background: '#fff',
                  color: '#0F172A',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <span style={{ fontSize: 18 }}>G</span>
                Google
              </button>
              <button
                onClick={() => handleSSO('apple')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '14px',
                  borderRadius: 18,
                  border: '1px solid #E2E8F0',
                  background: '#fff',
                  color: '#0F172A',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <span style={{ fontSize: 18 }}></span>
                Apple
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748B', fontSize: 13, lineHeight: 1.6 }}>
            🎓 Plataforma gratuita para candidatos ao PSM I
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: 16,
          padding: '14px 16px',
          fontSize: 15,
          color: '#0F172A',
          outline: 'none',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
          width: '100%',
        }}
        onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
      />
    </div>
  );
}

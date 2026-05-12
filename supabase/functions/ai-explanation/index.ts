// supabase/functions/ai-explanation/index.ts
// Deploy: supabase functions deploy ai-explanation

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { question, selectedOption, correctOption, explanation } = await req.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
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
    })

    const data = await response.json()
    const aiText = data.content?.[0]?.text || explanation

    return new Response(JSON.stringify({ explanation: aiText }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})

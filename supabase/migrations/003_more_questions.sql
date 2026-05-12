-- ============================================================
-- SEED: Mais questões por tópico (garante 25+ por trilha)
-- Execute APÓS a migration 002
-- ============================================================

INSERT INTO questions (topic, difficulty, question_text, options, correct_option, explanation, scrum_guide_ref) VALUES

-- ───────── FRAMEWORK (adicionar mais 15) ─────────
('framework','basico',
'Qual é a duração máxima de uma Sprint?',
'[{"id":"a","text":"2 semanas"},{"id":"b","text":"3 semanas"},{"id":"c","text":"1 mês"},{"id":"d","text":"6 semanas"}]',
'c','Uma Sprint tem duração máxima de um mês (30 dias). Sprints mais curtas são comuns e até recomendadas para maior inspeção e adaptação.','Scrum Guide 2020 - A Sprint'),

('framework','intermediario',
'Quais são os três pilares do empirismo no Scrum?',
'[{"id":"a","text":"Planejamento, Execução e Revisão"},{"id":"b","text":"Transparência, Inspeção e Adaptação"},{"id":"c","text":"Colaboração, Entrega e Melhoria"},{"id":"d","text":"Visão, Missão e Valores"}]',
'b','O Scrum se fundamenta no empirismo e no lean thinking. O empirismo afirma que o conhecimento vem da experiência e que as decisões se baseiam no que é observado. Os três pilares são Transparência, Inspeção e Adaptação.','Scrum Guide 2020 - Teoria do Scrum'),

('framework','avancado',
'O que é o "lean thinking" no contexto do Scrum?',
'[{"id":"a","text":"Uma metodologia para reduzir o time de desenvolvimento"},{"id":"b","text":"Reduzir desperdícios e focar no essencial para o todo"},{"id":"c","text":"Um processo de manufatura adaptado para software"},{"id":"d","text":"A prática de usar menos desenvolvedores no projeto"}]',
'b','O lean thinking no Scrum significa reduzir o desperdício e focar no essencial. Junto com o empirismo, forma a base filosófica do Scrum.','Scrum Guide 2020 - Teoria do Scrum'),

('framework','basico',
'Quantas pessoas compõem um Scrum Team ideal?',
'[{"id":"a","text":"3 a 5 pessoas"},{"id":"b","text":"10 ou mais pessoas"},{"id":"c","text":"Normalmente 10 ou menos"},{"id":"d","text":"Exatamente 7 pessoas"}]',
'c','O Scrum Team é suficientemente pequeno para permanecer ágil e suficientemente grande para completar trabalho significativo. Normalmente tem 10 ou menos pessoas.','Scrum Guide 2020 - Scrum Team'),

('framework','intermediario',
'O Scrum Team é auto-gerenciável. O que isso significa?',
'[{"id":"a","text":"Não precisa de um gerente de projeto"},{"id":"b","text":"Internamente decide quem faz o quê, quando e como"},{"id":"c","text":"Cada membro trabalha de forma independente"},{"id":"d","text":"O Scrum Master gerencia todas as decisões"}]',
'b','Auto-gerenciável significa que o time internamente decide quem faz o quê, quando e como. Isso não elimina o Scrum Master, mas muda o papel de gestão.','Scrum Guide 2020 - Scrum Team'),

('framework','intermediario',
'O que NÃO é verdadeiro sobre o Scrum?',
'[{"id":"a","text":"É um framework leve"},{"id":"b","text":"É um processo completo e prescritivo para desenvolvimento de software"},{"id":"c","text":"Requer transparência, inspeção e adaptação"},{"id":"d","text":"Pode ser usado para problemas complexos"}]',
'b','O Scrum é um framework, não um processo completo e prescritivo. Ele propositalmente não prescreve técnicas específicas — deixa espaço para outras práticas e metodologias dentro dele.','Scrum Guide 2020 - Definição do Scrum'),

('framework','avancado',
'Qual dos cinco valores do Scrum descreve melhor a disposição de fazer a coisa certa mesmo quando é difícil?',
'[{"id":"a","text":"Foco"},{"id":"b","text":"Respeito"},{"id":"c","text":"Coragem"},{"id":"d","text":"Abertura"}]',
'c','Coragem é o valor que representa a disposição dos membros do Scrum Team de fazer a coisa certa e trabalhar em problemas difíceis. É essencial para transparência e melhoria contínua.','Scrum Guide 2020 - Valores do Scrum'),

('framework','basico',
'Quando uma Sprint pode ser cancelada?',
'[{"id":"a","text":"Quando o time não consegue completar todas as histórias planejadas"},{"id":"b","text":"Quando o Product Owner decide que a Meta da Sprint se tornou obsoleta"},{"id":"c","text":"Quando o Scrum Master identifica impedimentos"},{"id":"d","text":"Quando os stakeholders solicitam uma mudança urgente"}]',
'b','Apenas o Product Owner tem autoridade para cancelar uma Sprint. Isso acontece quando a Meta da Sprint se torna obsoleta — por mudança de direção da empresa, mercado, etc.','Scrum Guide 2020 - Cancelamento da Sprint'),

-- ───────── EVENTOS (adicionar mais 10) ─────────
('eventos','basico',
'Qual é o time-box da Daily Scrum?',
'[{"id":"a","text":"30 minutos"},{"id":"b","text":"15 minutos"},{"id":"c","text":"1 hora"},{"id":"d","text":"Sem limite definido"}]',
'b','A Daily Scrum tem um time-box de 15 minutos. Ocorre diariamente, no mesmo horário e local, para reduzir complexidade.','Scrum Guide 2020 - Daily Scrum'),

('eventos','intermediario',
'Quem DEVE participar da Sprint Planning?',
'[{"id":"a","text":"Apenas os Developers"},{"id":"b","text":"O Scrum Team inteiro"},{"id":"c","text":"O Product Owner e o Scrum Master"},{"id":"d","text":"Os stakeholders e o Product Owner"}]',
'b','Todo o Scrum Team participa da Sprint Planning: Product Owner, Scrum Master e Developers. Convidados externos também podem ser chamados pelo Scrum Team para fornecer conselhos.','Scrum Guide 2020 - Sprint Planning'),

('eventos','avancado',
'O que o Scrum Team inspeciona na Sprint Retrospective?',
'[{"id":"a","text":"O produto incrementado e o feedback dos clientes"},{"id":"b","text":"Como a última Sprint foi em relação a indivíduos, interações, processos, ferramentas e Definição de Pronto"},{"id":"c","text":"O Product Backlog e as histórias planejadas"},{"id":"d","text":"Os KPIs do negócio e as métricas de entrega"}]',
'b','A Sprint Retrospective inspeciona como a Sprint foi em relação a pessoas, interações, processos, ferramentas e a Definição de Pronto. O objetivo é criar um plano de melhoria.','Scrum Guide 2020 - Sprint Retrospective'),

('eventos','basico',
'Qual é o propósito da Sprint Review?',
'[{"id":"a","text":"Planejar as tarefas da próxima Sprint"},{"id":"b","text":"Inspecionar o resultado da Sprint e adaptar o Product Backlog"},{"id":"c","text":"Revisar os processos internos do time"},{"id":"d","text":"Apresentar métricas de velocidade para a diretoria"}]',
'b','A Sprint Review inspeciona o resultado da Sprint e determina adaptações futuras. O Scrum Team apresenta os resultados do trabalho aos stakeholders-chave e discute o progresso em direção à Meta do Produto.','Scrum Guide 2020 - Sprint Review'),

('eventos','intermediario',
'Qual é o time-box da Sprint Planning para uma Sprint de 1 mês?',
'[{"id":"a","text":"4 horas"},{"id":"b","text":"8 horas"},{"id":"c","text":"2 horas"},{"id":"d","text":"16 horas"}]',
'b','A Sprint Planning tem time-box de 8 horas para uma Sprint de um mês. Para Sprints mais curtas, o evento costuma ser mais curto.','Scrum Guide 2020 - Sprint Planning'),

('eventos','avancado',
'Durante a Sprint, um stakeholder solicita uma mudança urgente de prioridade. Como o Scrum Team deve agir?',
'[{"id":"a","text":"Aceitar imediatamente e replanejam a Sprint"},{"id":"b","text":"O Scrum Master avalia e decide se aceita ou não"},{"id":"c","text":"O Product Owner pode negociar o escopo com os Developers sem cancelar a Sprint"},{"id":"d","text":"Ignorar a solicitação e continuar com o plano original"}]',
'c','Durante a Sprint, o escopo pode ser clarificado e renegociado entre o Product Owner e os Developers à medida que mais é aprendido. Cancelar a Sprint é uma medida drástica reservada para quando a Meta se torna obsoleta.','Scrum Guide 2020 - A Sprint'),

-- ───────── PAPÉIS (adicionar mais 10) ─────────
('papeis','basico',
'Quem é responsável por ordenar o Product Backlog?',
'[{"id":"a","text":"O Scrum Master"},{"id":"b","text":"Os Developers"},{"id":"c","text":"O Product Owner"},{"id":"d","text":"Os Stakeholders"}]',
'c','O Product Owner é o único responsável pelo gerenciamento eficaz do Product Backlog, incluindo sua ordenação. Ele pode delegar esse trabalho, mas continua sendo o responsável.','Scrum Guide 2020 - Product Owner'),

('papeis','intermediario',
'Qual é a responsabilidade dos Developers em relação à qualidade?',
'[{"id":"a","text":"Entregar funcionalidades o mais rápido possível"},{"id":"b","text":"Criar um plano para a Sprint (Sprint Backlog) e adaptar o plano diariamente"},{"id":"c","text":"Seguir as ordens do Product Owner sem questionar"},{"id":"d","text":"Testar apenas as funcionalidades críticas"}]',
'b','Os Developers são responsáveis por criar o Sprint Backlog, instilando qualidade ao seguir a Definição de Pronto, adaptando o plano diariamente e responsabilizando-se mutuamente como profissionais.','Scrum Guide 2020 - Developers'),

('papeis','avancado',
'Como o Scrum Master serve à organização?',
'[{"id":"a","text":"Gerenciando todos os projetos de TI da empresa"},{"id":"b","text":"Liderando, treinando e guiando a adoção do Scrum; planejando implementações; ajudando stakeholders a entender o Scrum"},{"id":"c","text":"Contratando e demitindo membros do time"},{"id":"d","text":"Definindo prioridades de negócio para o Product Owner"}]',
'b','O Scrum Master serve à organização de várias formas: liderando, treinando e guiando na adoção do Scrum; planejando e aconselhando implementações; ajudando funcionários e stakeholders a entender o Scrum.','Scrum Guide 2020 - Scrum Master'),

('papeis','basico',
'O Product Owner pode ser um comitê?',
'[{"id":"a","text":"Sim, é recomendado ter múltiplas pessoas no papel"},{"id":"b","text":"Não, o Product Owner é sempre uma única pessoa"},{"id":"c","text":"Sim, desde que haja um líder definido"},{"id":"d","text":"Depende do tamanho da organização"}]',
'b','O Product Owner é uma única pessoa, não um comitê. Ele pode representar as necessidades de muitos stakeholders no Product Backlog, mas apenas um Product Owner existe por Scrum Team.','Scrum Guide 2020 - Product Owner'),

('papeis','intermediario',
'Quem pode remover impedimentos que estão além da capacidade do Scrum Team?',
'[{"id":"a","text":"O Product Owner"},{"id":"b","text":"O Scrum Master, fazendo isso parte do seu serviço ao Scrum Team"},{"id":"c","text":"Os Developers mais seniores"},{"id":"d","text":"A diretoria da empresa"}]',
'b','O Scrum Master é responsável pela eficácia do Scrum Team. Isso inclui causar a remoção de impedimentos ao progresso do Scrum Team — mesmo quando isso requer influenciar a organização.','Scrum Guide 2020 - Scrum Master'),

('papeis','avancado',
'Um Developer pode questionar a prioridade definida pelo Product Owner?',
'[{"id":"a","text":"Não, o Product Owner tem autoridade total sobre o backlog"},{"id":"b","text":"Sim, os Developers devem levantar preocupações técnicas e de qualidade que impactem as decisões"},{"id":"c","text":"Somente através do Scrum Master"},{"id":"d","text":"Apenas durante a Sprint Retrospective"}]',
'b','Embora o Product Owner tenha autoridade sobre o Product Backlog, os Developers devem colaborar e levantar preocupações técnicas. O Scrum é baseado em respeito mútuo e transparência — questionar de forma construtiva é esperado.','Scrum Guide 2020 - Scrum Team'),

-- ───────── ARTEFATOS (adicionar mais 10) ─────────
('artefatos','basico',
'O que é a Definição de Pronto (Definition of Done)?',
'[{"id":"a","text":"A lista de critérios de aceitação de uma história de usuário"},{"id":"b","text":"Uma descrição formal do estado do Incremento quando atende às medidas de qualidade exigidas"},{"id":"c","text":"O checklist de deploy para produção"},{"id":"d","text":"O acordo entre o Product Owner e o cliente sobre entrega"}]',
'b','A Definição de Pronto é uma descrição formal do estado do Incremento quando ele atende às medidas de qualidade exigidas para o produto. No momento em que um item do Product Backlog atende à Definição de Pronto, um Incremento nasce.','Scrum Guide 2020 - Definição de Pronto'),

('artefatos','intermediario',
'O que é a Meta do Produto?',
'[{"id":"a","text":"O objetivo da Sprint atual"},{"id":"b","text":"Um estado futuro de longo prazo do produto que serve de alvo para o Scrum Team planejar"},{"id":"c","text":"A visão do produto definida pelos stakeholders"},{"id":"d","text":"O conjunto de funcionalidades do próximo release"}]',
'b','A Meta do Produto descreve um estado futuro do produto e serve como alvo de longo prazo para o Scrum Team. Ela é o compromisso do Product Backlog. O Scrum Team deve cumprir ou abandonar uma Meta do Produto antes de assumir outra.','Scrum Guide 2020 - Product Backlog'),

('artefatos','avancado',
'O que acontece com os itens do Sprint Backlog que não são concluídos ao final da Sprint?',
'[{"id":"a","text":"São automaticamente entregues como incremento parcial"},{"id":"b","text":"Voltam ao Product Backlog para reordenação pelo Product Owner"},{"id":"c","text":"São transferidos para a próxima Sprint automaticamente"},{"id":"d","text":"O Scrum Master decide o que fazer com eles"}]',
'b','Os itens não concluídos voltam ao Product Backlog. Eles não são automaticamente transferidos para a próxima Sprint — o Product Owner os reavalia, reordena e o Scrum Team decide o que incluir na próxima Sprint Planning.','Scrum Guide 2020 - Sprint Backlog'),

('artefatos','basico',
'Quem pode adicionar itens ao Product Backlog?',
'[{"id":"a","text":"Qualquer stakeholder"},{"id":"b","text":"Apenas o Product Owner"},{"id":"c","text":"O Scrum Master e o Product Owner"},{"id":"d","text":"Qualquer membro do Scrum Team"}]',
'b','O Product Owner é o único responsável pelo Product Backlog. Somente ele pode adicionar, remover ou reordenar itens — embora possa considerar sugestões de qualquer pessoa.','Scrum Guide 2020 - Product Backlog'),

('artefatos','intermediario',
'Qual é a diferença entre o Product Backlog e o Sprint Backlog?',
'[{"id":"a","text":"Não há diferença — são o mesmo artefato com nomes diferentes"},{"id":"b","text":"O Product Backlog contém todo o trabalho conhecido para o produto; o Sprint Backlog contém os itens selecionados para a Sprint atual mais o plano para entregá-los"},{"id":"c","text":"O Sprint Backlog é de responsabilidade do Scrum Master"},{"id":"d","text":"O Product Backlog só existe na fase de planejamento"}]',
'b','O Product Backlog é a lista ordenada emergente de tudo que é necessário para o produto. O Sprint Backlog é composto pela Meta da Sprint, os itens do Product Backlog selecionados para a Sprint e o plano para entregá-los — pertence exclusivamente aos Developers.','Scrum Guide 2020 - Artefatos'),

('artefatos','avancado',
'O que é "refinamento" do Product Backlog?',
'[{"id":"a","text":"Um evento formal do Scrum que ocorre uma vez por Sprint"},{"id":"b","text":"O ato de decompor e definir melhor os itens do Product Backlog em itens menores e mais precisos — é uma atividade contínua"},{"id":"c","text":"A revisão do backlog feita pelo Product Owner sozinho"},{"id":"d","text":"A remoção de itens desatualizados do backlog"}]',
'b','O refinamento do Product Backlog é o ato de decompor e definir melhor os itens em itens menores e mais precisos. É uma atividade contínua — não um evento formal — que adiciona detalhes, ordem e tamanho aos itens.','Scrum Guide 2020 - Product Backlog');

// ==============================================
// SISTEMA DE GAMIFICAÇÃO
// ==============================================

const { v4: uuidv4 } = require('uuid');
const { 
  getGamificacaoByAluno,
  updateItem,
  logInteraction
} = require('../shared/cosmosClient');
const { 
  validateToken, 
  handleError, 
  successResponse, 
  errorResponse 
} = require('../shared/middleware');

// ==============================================
// CONFIGURAÇÕES DE GAMIFICAÇÃO
// ==============================================

const NIVEIS = [
  { nivel: 1, nome: 'Iniciante', pontosNecessarios: 0 },
  { nivel: 2, nome: 'Aprendiz', pontosNecessarios: 100 },
  { nivel: 3, nome: 'Estudante', pontosNecessarios: 300 },
  { nivel: 4, nome: 'Dedicado', pontosNecessarios: 600 },
  { nivel: 5, nome: 'Aprendiz Avançado', pontosNecessarios: 1000 },
  { nivel: 6, nome: 'Expert', pontosNecessarios: 1500 },
  { nivel: 7, nome: 'Mestre', pontosNecessarios: 2500 },
  { nivel: 8, nome: 'Sábio', pontosNecessarios: 4000 },
  { nivel: 9, nome: 'Gênio', pontosNecessarios: 6000 },
  { nivel: 10, nome: 'Mestre do Conhecimento', pontosNecessarios: 10000 }
];

const BADGES = {
  'matematico': {
    id: 'badge-matematico',
    nome: 'Matemático',
    descricao: 'Complete 50 exercícios de matemática',
    icone: '🧮',
    raridade: 'raro',
    criterio: { tipo: 'exercicios', materia: 'Matemática', quantidade: 50 }
  },
  'leitor-assiduo': {
    id: 'badge-leitor',
    nome: 'Leitor Assíduo',
    descricao: 'Complete 50 exercícios de português',
    icone: '📚',
    raridade: 'raro',
    criterio: { tipo: 'exercicios', materia: 'Português', quantidade: 50 }
  },
  'cientista': {
    id: 'badge-cientista',
    nome: 'Cientista',
    descricao: 'Complete 50 exercícios de ciências',
    icone: '🔬',
    raridade: 'raro',
    criterio: { tipo: 'exercicios', materia: 'Ciências', quantidade: 50 }
  },
  'streak-7': {
    id: 'badge-streak-7',
    nome: 'Dedicação Semanal',
    descricao: 'Estude 7 dias seguidos',
    icone: '🔥',
    raridade: 'epico',
    criterio: { tipo: 'streak', dias: 7 }
  },
  'streak-30': {
    id: 'badge-streak-30',
    nome: 'Dedicação Mensal',
    descricao: 'Estude 30 dias seguidos',
    icone: '⭐',
    raridade: 'lendario',
    criterio: { tipo: 'streak', dias: 30 }
  },
  'perfeccionista': {
    id: 'badge-perfeccionista',
    nome: 'Perfeccionista',
    descricao: 'Acerte 20 exercícios seguidos',
    icone: '💯',
    raridade: 'epico',
    criterio: { tipo: 'acertos-seguidos', quantidade: 20 }
  },
  'noturno': {
    id: 'badge-noturno',
    nome: 'Coruja Noturna',
    descricao: 'Estude 10 vezes após 22h',
    icone: '🦉',
    raridade: 'raro',
    criterio: { tipo: 'horario', hora: 22, quantidade: 10 }
  },
  'madrugador': {
    id: 'badge-madrugador',
    nome: 'Madrugador',
    descricao: 'Estude 10 vezes antes das 7h',
    icone: '🌅',
    raridade: 'raro',
    criterio: { tipo: 'horario', hora: 7, quantidade: 10 }
  }
};

// ==============================================
// HANDLER PRINCIPAL
// ==============================================

module.exports = async function (context, req) {
  context.log('Gamificação - Início');
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = { status: 200, body: '' };
    return;
  }
  
  try {
    // Validar token
    const user = validateToken(context, req);
    if (!user) return;
    
    if (req.method === 'GET') {
      await handleGet(context, req, user);
    } else if (req.method === 'POST') {
      await handlePost(context, req, user);
    }
    
  } catch (error) {
    handleError(context, error);
  }
};

// ==============================================
// GET - BUSCAR GAMIFICAÇÃO DO ALUNO
// ==============================================

async function handleGet(context, req, user) {
  const alunoId = req.params.alunoId || user.alunoId;
  
  if (user.alunoId !== alunoId) {
    context.res = errorResponse('Não autorizado', 403);
    return;
  }
  
  const gamificacao = await getGamificacaoByAluno(alunoId);
  
  if (!gamificacao) {
    context.res = errorResponse('Gamificação não encontrada', 404);
    return;
  }
  
  // Gerar missões diárias se necessário
  gamificacao.missoesDiarias = await gerarMissoesDiarias(alunoId, gamificacao);
  
  context.res = successResponse(gamificacao);
}

// ==============================================
// POST - ADICIONAR PONTOS
// ==============================================

async function handlePost(context, req, user) {
  const { alunoId, pontos, materia, acao } = req.body;
  
  if (!alunoId || pontos === undefined) {
    context.res = errorResponse('alunoId e pontos são obrigatórios', 400);
    return;
  }
  
  if (user.alunoId !== alunoId) {
    context.res = errorResponse('Não autorizado', 403);
    return;
  }
  
  const gamificacao = await getGamificacaoByAluno(alunoId);
  
  if (!gamificacao) {
    context.res = errorResponse('Gamificação não encontrada', 404);
    return;
  }
  
  // Adicionar pontos
  gamificacao.pontuacao.total += pontos;
  
  if (materia) {
    if (!gamificacao.pontuacao.porMateria[materia]) {
      gamificacao.pontuacao.porMateria[materia] = 0;
    }
    gamificacao.pontuacao.porMateria[materia] += pontos;
  }
  
  // Atualizar conquistas
  if (acao === 'exercicio-completo') {
    gamificacao.conquistas.exerciciosCompletos++;
  } else if (acao === 'jogo-jogado') {
    gamificacao.conquistas.jogosJogados++;
  } else if (acao === 'ajuda-professora') {
    gamificacao.conquistas.ajudasProfessora++;
  }
  
  // Atualizar streak
  const hoje = new Date().toISOString().split('T')[0];
  if (gamificacao.streak.ultimoDia !== hoje) {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];
    
    if (gamificacao.streak.ultimoDia === ontemStr) {
      gamificacao.streak.atual++;
    } else {
      gamificacao.streak.atual = 1;
    }
    
    gamificacao.streak.ultimoDia = hoje;
    
    if (gamificacao.streak.atual > gamificacao.streak.melhor) {
      gamificacao.streak.melhor = gamificacao.streak.atual;
    }
  }
  
  // Calcular novo nível
  const nivelAnterior = gamificacao.nivel.atual;
  const novoNivel = calcularNivel(gamificacao.pontuacao.total);
  gamificacao.nivel = novoNivel;
  
  const subiuNivel = novoNivel.atual > nivelAnterior;
  
  // Verificar badges conquistadas
  const novasBadges = await verificarBadges(gamificacao);
  
  // Atualizar missões diárias
  await atualizarMissoesDiarias(gamificacao, acao, materia);
  
  gamificacao.ultimaAtualizacao = new Date().toISOString();
  
  // Salvar no banco
  await updateItem('Gamificacao', gamificacao);
  
  // Log
  await logInteraction(alunoId, 'gamificacao-atualizada', {
    pontosGanhos: pontos,
    pontuacaoTotal: gamificacao.pontuacao.total,
    nivel: gamificacao.nivel.atual,
    subiuNivel,
    novasBadges
  });
  
  // Resposta
  context.res = successResponse({
    gamificacao,
    notificacoes: {
      pontosGanhos: pontos,
      subiuNivel,
      novoNivel: subiuNivel ? novoNivel.nome : null,
      novasBadges,
      streakAtual: gamificacao.streak.atual
    }
  });
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function calcularNivel(pontosTotal) {
  let nivelAtual = NIVEIS[0];
  let proximoNivel = NIVEIS[1];
  
  for (let i = 0; i < NIVEIS.length; i++) {
    if (pontosTotal >= NIVEIS[i].pontosNecessarios) {
      nivelAtual = NIVEIS[i];
      proximoNivel = NIVEIS[i + 1] || NIVEIS[i];
    } else {
      break;
    }
  }
  
  const pontosParaProximo = proximoNivel.pontosNecessarios - pontosTotal;
  const pontosNecessariosNivel = proximoNivel.pontosNecessarios - nivelAtual.pontosNecessarios;
  const pontosNoNivel = pontosTotal - nivelAtual.pontosNecessarios;
  const porcentagem = pontosNecessariosNivel > 0 
    ? Math.round((pontosNoNivel / pontosNecessariosNivel) * 100)
    : 100;
  
  return {
    atual: nivelAtual.nivel,
    nome: nivelAtual.nome,
    proximoNivel: proximoNivel.nivel,
    pontosParaProximo: Math.max(0, pontosParaProximo),
    porcentagem: Math.min(100, porcentagem)
  };
}

async function verificarBadges(gamificacao) {
  const novasBadges = [];
  const badgesConquistadas = gamificacao.badges.map(b => b.id);
  
  for (const [key, badge] of Object.entries(BADGES)) {
    if (badgesConquistadas.includes(badge.id)) continue;
    
    let conquistou = false;
    const criterio = badge.criterio;
    
    if (criterio.tipo === 'exercicios') {
      const totalMateria = gamificacao.pontuacao.porMateria[criterio.materia] || 0;
      // Aproximação: 10 pontos por exercício
      const exerciciosMateria = Math.floor(totalMateria / 10);
      conquistou = exerciciosMateria >= criterio.quantidade;
    } else if (criterio.tipo === 'streak') {
      conquistou = gamificacao.streak.atual >= criterio.dias;
    }
    
    if (conquistou) {
      const badgeConquistada = {
        ...badge,
        conquistadoEm: new Date().toISOString()
      };
      gamificacao.badges.push(badgeConquistada);
      novasBadges.push(badgeConquistada);
    }
  }
  
  return novasBadges;
}

async function gerarMissoesDiarias(alunoId, gamificacao) {
  const hoje = new Date().toISOString().split('T')[0];
  
  // Verificar se já tem missões de hoje
  const missoesHoje = gamificacao.missoesDiarias.filter(m => 
    m.id.includes(hoje)
  );
  
  if (missoesHoje.length >= 3) {
    return gamificacao.missoesDiarias;
  }
  
  // Gerar 3 missões novas
  const missoes = [
    {
      id: `missao-${hoje}-1`,
      titulo: 'Pratique Matemática',
      descricao: 'Complete 5 exercícios de matemática',
      progresso: 0,
      meta: 5,
      recompensa: 50,
      concluida: false,
      tipo: 'exercicios',
      materia: 'Matemática',
      expiraEm: `${hoje}T23:59:59Z`
    },
    {
      id: `missao-${hoje}-2`,
      titulo: 'Sequência Perfeita',
      descricao: 'Acerte 3 exercícios seguidos',
      progresso: 0,
      meta: 3,
      recompensa: 75,
      concluida: false,
      tipo: 'acertos-seguidos',
      expiraEm: `${hoje}T23:59:59Z`
    },
    {
      id: `missao-${hoje}-3`,
      titulo: 'Estudante Dedicado',
      descricao: 'Estude por 30 minutos',
      progresso: 0,
      meta: 30,
      recompensa: 100,
      concluida: false,
      tipo: 'tempo-estudo',
      expiraEm: `${hoje}T23:59:59Z`
    }
  ];
  
  return missoes;
}

async function atualizarMissoesDiarias(gamificacao, acao, materia) {
  if (!gamificacao.missoesDiarias) return;
  
  for (const missao of gamificacao.missoesDiarias) {
    if (missao.concluida) continue;
    
    // Verificar expiração
    if (new Date(missao.expiraEm) < new Date()) {
      continue;
    }
    
    if (missao.tipo === 'exercicios' && acao === 'exercicio-completo') {
      if (!missao.materia || missao.materia === materia) {
        missao.progresso++;
      }
    }
    
    if (missao.progresso >= missao.meta) {
      missao.concluida = true;
      gamificacao.pontuacao.total += missao.recompensa;
    }
  }
}

module.exports.NIVEIS = NIVEIS;
module.exports.BADGES = BADGES;

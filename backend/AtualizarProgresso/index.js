// ==============================================
// ATUALIZAR PROGRESSO DO ALUNO
// ==============================================

const { v4: uuidv4 } = require('uuid');
const { 
  queryItems,
  createItem,
  updateItem,
  logInteraction
} = require('../shared/cosmosClient');
const { 
  validateToken,
  validateInput, 
  handleError, 
  successResponse, 
  errorResponse 
} = require('../shared/middleware');

module.exports = async function (context, req) {
  context.log('Atualizar Progresso - Início');
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    context.res = { status: 200, body: '' };
    return;
  }
  
  try {
    // 1. Validar token
    const user = validateToken(context, req);
    if (!user) return;
    
    // 2. Validar input
    const validation = validateInput(req.body, 'atualizarProgresso');
    if (!validation.valid) {
      context.res = errorResponse('Dados inválidos', 400);
      context.res.body.errors = validation.errors;
      return;
    }
    
    const { alunoId, materia, topico, subtopico, resultado } = validation.value;
    
    // 3. Verificar se aluno pertence ao usuário autenticado
    if (user.alunoId !== alunoId) {
      context.res = errorResponse('Não autorizado', 403);
      return;
    }
    
    // 4. Buscar ou criar registro de progresso
    const progressoExistente = await queryItems('Progresso',
      'SELECT * FROM c WHERE c.alunoId = @alunoId AND c.materia = @materia AND c.topico = @topico',
      [
        { name: '@alunoId', value: alunoId },
        { name: '@materia', value: materia },
        { name: '@topico', value: topico }
      ]
    );
    
    let progressoDoc;
    
    if (progressoExistente.length > 0) {
      // Atualizar existente
      progressoDoc = progressoExistente[0];
      
      progressoDoc.exercicios.tentados++;
      if (resultado.correto) {
        progressoDoc.exercicios.corretos++;
      } else {
        progressoDoc.exercicios.errados++;
      }
      progressoDoc.exercicios.taxaAcerto = 
        (progressoDoc.exercicios.corretos / progressoDoc.exercicios.tentados) * 100;
      
      progressoDoc.tempoEstudo.totalMinutos += Math.round(resultado.tempoSegundos / 60);
      progressoDoc.tempoEstudo.ultimaSessao = Math.round(resultado.tempoSegundos / 60);
      
      progressoDoc.historico.push({
        data: new Date().toISOString(),
        exerciciosFeitos: 1,
        acertos: resultado.correto ? 1 : 0,
        tempoMinutos: Math.round(resultado.tempoSegundos / 60),
        ajudaProfessora: resultado.ajudaProfessora ? 1 : 0
      });
      
      // Calcular nível baseado na taxa de acerto
      if (progressoDoc.exercicios.taxaAcerto >= 90) {
        progressoDoc.nivel.atual = 5;
      } else if (progressoDoc.exercicios.taxaAcerto >= 80) {
        progressoDoc.nivel.atual = 4;
      } else if (progressoDoc.exercicios.taxaAcerto >= 70) {
        progressoDoc.nivel.atual = 3;
      } else if (progressoDoc.exercicios.taxaAcerto >= 60) {
        progressoDoc.nivel.atual = 2;
      } else {
        progressoDoc.nivel.atual = 1;
      }
      
      progressoDoc.nivel.porcentagem = Math.round(
        (progressoDoc.nivel.atual / progressoDoc.nivel.total) * 100
      );
      
      progressoDoc.dataUltimaAtualizacao = new Date().toISOString();
      
      await updateItem('Progresso', progressoDoc);
      
    } else {
      // Criar novo
      progressoDoc = {
        id: uuidv4(),
        alunoId,
        materia,
        topico,
        subtopico: subtopico || '',
        nivel: {
          atual: resultado.correto ? 2 : 1,
          total: 5,
          porcentagem: resultado.correto ? 40 : 20
        },
        exercicios: {
          tentados: 1,
          corretos: resultado.correto ? 1 : 0,
          errados: resultado.correto ? 0 : 1,
          taxaAcerto: resultado.correto ? 100 : 0
        },
        tempoEstudo: {
          totalMinutos: Math.round(resultado.tempoSegundos / 60),
          ultimaSessao: Math.round(resultado.tempoSegundos / 60),
          media: Math.round(resultado.tempoSegundos / 60)
        },
        historico: [{
          data: new Date().toISOString(),
          exerciciosFeitos: 1,
          acertos: resultado.correto ? 1 : 0,
          tempoMinutos: Math.round(resultado.tempoSegundos / 60),
          ajudaProfessora: resultado.ajudaProfessora ? 1 : 0
        }],
        status: 'em-progresso',
        concluido: false,
        dataInicio: new Date().toISOString(),
        dataUltimaAtualizacao: new Date().toISOString()
      };
      
      await createItem('Progresso', progressoDoc);
    }
    
    // 5. Registrar log de uso
    await logInteraction(alunoId, 'exercicio-completo', {
      materia,
      topico,
      subtopico,
      resultado: resultado.correto ? 'correto' : 'incorreto',
      tempoSegundos: resultado.tempoSegundos,
      tentativas: resultado.tentativas,
      ajudaProfessora: resultado.ajudaProfessora
    });
    
    // 6. Atualizar gamificação (chamar função separada)
    const pontosGanhos = calcularPontos(resultado);
    
    // 7. Resposta de sucesso
    context.res = successResponse({
      progresso: progressoDoc,
      pontosGanhos,
      mensagem: resultado.correto 
        ? `Parabéns! Você acertou e ganhou ${pontosGanhos} pontos! 🎉`
        : 'Não desanime! Continue tentando, você vai conseguir! 💪'
    });
    
    context.log('Progresso atualizado com sucesso');
    
  } catch (error) {
    handleError(context, error);
  }
};

function calcularPontos(resultado) {
  let pontos = 10; // Base
  
  if (resultado.correto) {
    pontos += 10; // Acerto
    
    // Bônus por velocidade
    if (resultado.tempoSegundos < 30) {
      pontos += 5;
    }
    
    // Bônus por primeira tentativa
    if (resultado.tentativas === 1) {
      pontos += 10;
    }
    
    // Penalidade por usar ajuda
    if (resultado.ajudaProfessora) {
      pontos -= 5;
    }
  }
  
  return Math.max(0, pontos);
}

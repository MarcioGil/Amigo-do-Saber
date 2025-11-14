// ==============================================
// OPENAI CLIENT - Tia Dora 🎀
// ==============================================

const { OpenAI } = require('openai');

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY ou AZURE_OPENAI_KEY deve estar configurado');
    }
    
    // Se for Azure OpenAI
    if (process.env.AZURE_OPENAI_ENDPOINT) {
      const { AzureOpenAI } = require('openai');
      openaiClient = new AzureOpenAI({
        apiKey: process.env.AZURE_OPENAI_KEY,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiVersion: '2024-02-15-preview',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4'
      });
    } else {
      // OpenAI padrão
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }
  return openaiClient;
}

// ==============================================
// SYSTEM PROMPT - Tia Dora
// ==============================================

const TIA_DORA_SYSTEM_PROMPT = `Você é a Tia Dora 🎀, uma professora virtual carinhosa, paciente e dedicada que ensina crianças entre 6 e 14 anos.

## PERSONALIDADE DA TIA DORA

- **Carinhosa e Acolhedora**: Trate cada criança como se fosse sua sobrinha querida. Use "querido(a)", "meu amor", "meu bem" naturalmente.
- **Paciente e Encorajadora**: NUNCA repreenda erros. Sempre diga "Não tem problema, vamos tentar de novo!" ou "Que bom que você tentou!".
- **Didática e Clara**: Explique conceitos usando exemplos do dia a dia da criança (pizza, brinquedos, desenhos animados, futebol).
- **Entusiasta**: Use emojis com moderação (1-2 por mensagem). Celebre cada conquista com "Isso mesmo!", "Você acertou!", "Que orgulho!".
- **Respeitosa**: Nunca subestime a inteligência da criança. Se ela não entender, é porque você precisa explicar melhor.

## MÉTODO DE ENSINO DA TIA DORA

1. **Comece com Empatia**: "Oi querido! Vou te ajudar com isso!"
2. **Explique Conceitos Simples Primeiro**: Use analogias do cotidiano.
3. **Faça Perguntas de Verificação**: "Você entendeu até aqui?" ou "Quer que eu explique de outro jeito?".
4. **Dê Exemplos Práticos**: Sempre relacione com situações reais.
5. **NUNCA Dê a Resposta Direta**: Guie a criança até ela mesma descobrir.
6. **Celebre Tentativas**: Errar faz parte do aprendizado!

## ADAPTAÇÃO POR IDADE

- **6-8 anos**: Linguagem MUITO simples, frases curtas, exemplos concretos (brinquedos, animais).
- **9-11 anos**: Um pouco mais formal, mas ainda lúdico (jogos, esportes, aventuras).
- **12-14 anos**: Mais madura, mas empática (tecnologia, música, séries).

## MATÉRIAS QUE A TIA DORA ENSINA

- **Matemática**: Frações com pizza, multiplicação com coleções, geometria com formas do dia a dia.
- **Português**: Gramática com histórias, ortografia com músicas, interpretação com quadrinhos.
- **Ciências**: Experimentos mentais, natureza, corpo humano, meio ambiente.
- **História**: Histórias envolventes como aventuras no tempo.
- **Geografia**: Mapas como tesouros, países como personagens.
- **Inglês**: Palavras do cotidiano, músicas, expressões simples.

## REGRAS IMPORTANTES

❌ NUNCA faça:
- Dar a resposta pronta
- Usar linguagem técnica demais
- Repreender ou criticar
- Falar sobre tópicos não educacionais (política, religião, violência)
- Responder perguntas pessoais sobre você

✅ SEMPRE faça:
- Adapte seu vocabulário à idade da criança
- Use exemplos do mundo real
- Incentive a criança a pensar
- Celebre o esforço, não só o acerto
- Seja breve (máximo 3-4 parágrafos por resposta)

## EXEMPLO DE INTERAÇÃO

Criança: "Tia, não entendo fração"
Tia Dora: "Oi querido! 🎀 Vou te ajudar! Imagina uma pizza inteira. Se você cortar ela em 4 pedaços iguais, cada pedaço é 1/4 (um quarto) da pizza. Se você comer 2 pedaços, comeu 2/4 (dois quartos). Entendeu? Quer que eu explique com outro exemplo?"

Lembre-se: Você é a Tia Dora, a professora mais querida da Baixada! 💜`;

// ==============================================
// FUNÇÃO PRINCIPAL - Conversar com Tia Dora
// ==============================================

async function perguntarTiaDora(pergunta, contexto = {}) {
  const client = getOpenAIClient();
  
  // Construir mensagens
  const messages = [
    {
      role: 'system',
      content: TIA_DORA_SYSTEM_PROMPT
    }
  ];
  
  // Adicionar contexto do aluno se disponível
  if (contexto.aluno) {
    messages.push({
      role: 'system',
      content: `Contexto do aluno:
- Nome: ${contexto.aluno.nome}
- Idade: ${contexto.aluno.idade} anos
- Série: ${contexto.aluno.serie}
${contexto.materia ? `- Matéria atual: ${contexto.materia}` : ''}
${contexto.topico ? `- Tópico atual: ${contexto.topico}` : ''}
${contexto.dificuldades && contexto.dificuldades.length > 0 ? `- Dificuldades conhecidas: ${contexto.dificuldades.join(', ')}` : ''}`
    });
  }
  
  // Adicionar histórico de conversa (últimas 5 mensagens)
  if (contexto.historico && contexto.historico.length > 0) {
    const ultimasMensagens = contexto.historico.slice(-5);
    ultimasMensagens.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
  }
  
  // Adicionar pergunta atual
  messages.push({
    role: 'user',
    content: pergunta
  });
  
  // Chamar OpenAI
  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });
    
    const resposta = response.choices[0].message.content;
    const tokensUsados = response.usage.total_tokens;
    
    return {
      resposta,
      tokensUsados,
      modelo: response.model
    };
    
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    
    // Resposta de fallback se OpenAI falhar
    return {
      resposta: "Oi querido! 🎀 Estou com um probleminha técnico agora, mas não se preocupe! Tente perguntar de novo em alguns segundos, tá bom? A Tia Dora está aqui pra te ajudar sempre! 💜",
      erro: true,
      mensagemErro: error.message
    };
  }
}

// ==============================================
// MODERAÇÃO DE CONTEÚDO
// ==============================================

function verificarConteudoInapropriado(texto) {
  const palavrasProibidas = [
    // Adicione palavras inadequadas para crianças
    'palavrão1', 'palavrão2' // Placeholder
  ];
  
  const textoLower = texto.toLowerCase();
  
  for (const palavra of palavrasProibidas) {
    if (textoLower.includes(palavra)) {
      return {
        apropriado: false,
        motivo: 'Conteúdo inapropriado detectado'
      };
    }
  }
  
  // Verificar se é pergunta muito longa (possível spam)
  if (texto.length > 1000) {
    return {
      apropriado: false,
      motivo: 'Pergunta muito longa'
    };
  }
  
  return { apropriado: true };
}

// ==============================================
// EXPORTS
// ==============================================

module.exports = {
  getOpenAIClient,
  perguntarTiaDora,
  verificarConteudoInapropriado,
  TIA_DORA_SYSTEM_PROMPT
};

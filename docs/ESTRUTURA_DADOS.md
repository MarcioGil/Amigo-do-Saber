# 🗄️ Estrutura de Dados - Cosmos DB

## Visão Geral

O banco de dados `EduDB` é organizado em 4 contêineres principais, cada um com sua partition key específica para otimização de performance e custo.

---

## 📦 Contêiner: `Alunos`

**Partition Key**: `/id`

Armazena os perfis dos alunos e informações dos responsáveis.

### Schema

```json
{
  "id": "uuid-v4",
  "nome": "João Silva",
  "dataNascimento": "2015-03-15",
  "idade": 10,
  "serie": "5º Ano",
  "escola": "Escola Municipal da Baixada",
  "responsavel": {
    "nome": "Maria Silva",
    "email": "maria.silva@email.com",
    "telefone": "+55 21 98765-4321",
    "parentesco": "Mãe"
  },
  "materias": ["Matemática", "Português", "Ciências", "História", "Geografia"],
  "livrosDidaticos": [
    {
      "materia": "Matemática",
      "titulo": "Matemática - 5º Ano",
      "editora": "Editora Moderna",
      "isbn": "978-8516..."
    }
  ],
  "dificuldades": [
    {
      "materia": "Matemática",
      "topico": "Frações",
      "nivel": "alto",
      "detectadoEm": "2025-11-10T10:30:00Z"
    }
  ],
  "preferencias": {
    "tipoAtividade": ["jogos", "videos", "exercicios"],
    "horarioEstudo": ["tarde", "noite"],
    "acessibilidade": {
      "leitorDeTela": false,
      "altoContraste": false,
      "tamanhoFonte": "medio"
    }
  },
  "statusAtivo": true,
  "dataCriacao": "2025-11-01T08:00:00Z",
  "ultimoAcesso": "2025-11-13T14:30:00Z"
}
```

### Índices Recomendados

- `/serie`
- `/statusAtivo`
- `/ultimoAcesso`

---

## 📊 Contêiner: `Progresso`

**Partition Key**: `/alunoId`

Registra o desempenho e evolução do aluno em cada matéria e tópico.

### Schema

```json
{
  "id": "uuid-v4",
  "alunoId": "uuid-do-aluno",
  "materia": "Matemática",
  "topico": "Frações",
  "subtopico": "Frações Equivalentes",
  "nivel": {
    "atual": 3,
    "total": 5,
    "porcentagem": 60
  },
  "exercicios": {
    "tentados": 45,
    "corretos": 32,
    "errados": 13,
    "taxaAcerto": 71.1
  },
  "tempoEstudo": {
    "totalMinutos": 120,
    "ultimaSessao": 25,
    "media": 15
  },
  "historico": [
    {
      "data": "2025-11-13T14:00:00Z",
      "exerciciosFeitos": 5,
      "acertos": 4,
      "tempoMinutos": 12,
      "ajudaProfessora": 2
    }
  ],
  "status": "em-progresso",
  "concluido": false,
  "dataInicio": "2025-11-05T10:00:00Z",
  "dataUltimaAtualizacao": "2025-11-13T14:30:00Z"
}
```

---

## 🎮 Contêiner: `Gamificacao`

**Partition Key**: `/alunoId`

Gerencia pontos, níveis, badges e recompensas do aluno.

### Schema

```json
{
  "id": "uuid-v4",
  "alunoId": "uuid-do-aluno",
  "pontuacao": {
    "total": 1580,
    "porMateria": {
      "Matemática": 650,
      "Português": 480,
      "Ciências": 200,
      "Inglês": 250
    }
  },
  "nivel": {
    "atual": 8,
    "nome": "Aprendiz Avançado",
    "proximoNivel": 9,
    "pontosParaProximo": 420,
    "porcentagem": 79
  },
  "badges": [
    {
      "id": "badge-matematico",
      "nome": "Matemático",
      "descricao": "Complete 50 exercícios de matemática",
      "icone": "🧮",
      "conquistadoEm": "2025-11-10T16:00:00Z",
      "raridade": "raro"
    },
    {
      "id": "badge-streak-7",
      "nome": "Dedicação Semanal",
      "descricao": "Estude 7 dias seguidos",
      "icone": "🔥",
      "conquistadoEm": "2025-11-12T20:00:00Z",
      "raridade": "epico"
    }
  ],
  "missoesDiarias": [
    {
      "id": "missao-diaria-13-11",
      "titulo": "Pratique Frações",
      "descricao": "Complete 5 exercícios de frações",
      "progresso": 3,
      "meta": 5,
      "recompensa": 50,
      "concluida": false,
      "expiraEm": "2025-11-13T23:59:59Z"
    }
  ],
  "streak": {
    "atual": 7,
    "melhor": 12,
    "ultimoDia": "2025-11-13"
  },
  "conquistas": {
    "exerciciosCompletos": 127,
    "horasEstudo": 18.5,
    "ajudasProfessora": 34,
    "jogosJogados": 28
  },
  "ranking": {
    "posicaoGlobal": 342,
    "posicaoSerie": 28
  },
  "ultimaAtualizacao": "2025-11-13T14:30:00Z"
}
```

---

## 📝 Contêiner: `LogsDeUso`

**Partition Key**: `/alunoId`

Registra todas as interações do aluno para análise e Power BI.

### Schema

```json
{
  "id": "uuid-v4",
  "alunoId": "uuid-do-aluno",
  "tipo": "exercicio-completo",
  "timestamp": "2025-11-13T14:30:00Z",
  "sessao": {
    "sessaoId": "uuid-sessao",
    "inicio": "2025-11-13T14:00:00Z",
    "dispositivo": "mobile",
    "navegador": "Chrome Mobile"
  },
  "contexto": {
    "materia": "Matemática",
    "topico": "Frações",
    "atividadeId": "ex-fracoes-123",
    "dificuldade": "medio"
  },
  "dados": {
    "resultado": "correto",
    "tempoSegundos": 45,
    "tentativas": 1,
    "ajudaProfessora": false,
    "pontosGanhos": 10
  },
  "metricas": {
    "engajamento": 0.85,
    "confianca": 0.7,
    "velocidade": "normal"
  }
}
```

### Tipos de Eventos

| Tipo                  | Descrição                     |
| --------------------- | ----------------------------- |
| `login`               | Aluno fez login               |
| `logout`              | Aluno saiu                    |
| `exercicio-inicio`    | Iniciou exercício             |
| `exercicio-completo`  | Completou exercício           |
| `jogo-inicio`         | Iniciou jogo educativo        |
| `jogo-fim`            | Terminou jogo                 |
| `professora-pergunta` | Fez pergunta para professora  |
| `professora-resposta` | Recebeu resposta              |
| `bot-conselho`        | Interagiu com bot conselheiro |
| `badge-conquistada`   | Ganhou nova badge             |
| `nivel-subiu`         | Subiu de nível                |
| `missao-concluida`    | Completou missão diária       |

---

## 🔍 Queries Comuns

### 1. Buscar aluno por email do responsável

```sql
SELECT * FROM Alunos a
WHERE a.responsavel.email = 'maria.silva@email.com'
```

### 2. Alunos com dificuldade em tópico específico

```sql
SELECT a.nome, a.serie, d.nivel
FROM Alunos a
JOIN d IN a.dificuldades
WHERE d.materia = 'Matemática'
  AND d.topico = 'Frações'
  AND d.nivel = 'alto'
```

### 3. Progresso do aluno em todas as matérias

```sql
SELECT p.materia, p.nivel.porcentagem, p.exercicios.taxaAcerto
FROM Progresso p
WHERE p.alunoId = 'uuid-do-aluno'
ORDER BY p.materia
```

### 4. Top 10 alunos no ranking

```sql
SELECT a.nome, g.pontuacao.total, g.nivel.nome
FROM Gamificacao g
JOIN Alunos a ON a.id = g.alunoId
WHERE a.statusAtivo = true
ORDER BY g.pontuacao.total DESC
OFFSET 0 LIMIT 10
```

### 5. Eventos de uso nas últimas 24h

```sql
SELECT l.tipo, COUNT(1) as total
FROM LogsDeUso l
WHERE l.timestamp >= '2025-11-12T14:30:00Z'
GROUP BY l.tipo
```

---

## 🚀 Otimizações

### Partition Key Strategy

- **Alunos**: `/id` - Acesso direto por aluno
- **Progresso**: `/alunoId` - Todo progresso de um aluno em 1 partição
- **Gamificacao**: `/alunoId` - Dados de gamificação sempre juntos
- **LogsDeUso**: `/alunoId` - Análise por aluno eficiente

### Time-to-Live (TTL)

Configure TTL no contêiner `LogsDeUso` para deletar logs antigos:

```json
{
  "defaultTtl": 7776000 // 90 dias em segundos
}
```

### Indexing Policy

**Para Alunos:**

```json
{
  "indexingMode": "consistent",
  "includedPaths": [{ "path": "/*" }],
  "excludedPaths": [{ "path": "/livrosDidaticos/*" }, { "path": "/_etag/?" }]
}
```

---

## 📦 Scripts de Migração

### Criar Contêineres via Azure CLI

```bash
# Criar Database
az cosmosdb sql database create \
  --account-name cosmos-amigodosaber \
  --resource-group rg-amigodosaber \
  --name EduDB

# Criar Contêiner Alunos
az cosmosdb sql container create \
  --account-name cosmos-amigodosaber \
  --database-name EduDB \
  --name Alunos \
  --partition-key-path "/id"

# Criar Contêiner Progresso
az cosmosdb sql container create \
  --account-name cosmos-amigodosaber \
  --database-name EduDB \
  --name Progresso \
  --partition-key-path "/alunoId"

# Criar Contêiner Gamificacao
az cosmosdb sql container create \
  --account-name cosmos-amigodosaber \
  --database-name EduDB \
  --name Gamificacao \
  --partition-key-path "/alunoId"

# Criar Contêiner LogsDeUso
az cosmosdb sql container create \
  --account-name cosmos-amigodosaber \
  --database-name EduDB \
  --name LogsDeUso \
  --partition-key-path "/alunoId" \
  --ttl 7776000
```

---

## 🧪 Dados de Teste

Veja o arquivo `backend/scripts/seed-database.js` para popular o banco com dados de exemplo.

```bash
cd backend
node scripts/seed-database.js
```

---

**Dúvidas sobre a estrutura?** Consulte a [documentação oficial do Cosmos DB](https://docs.microsoft.com/azure/cosmos-db/).

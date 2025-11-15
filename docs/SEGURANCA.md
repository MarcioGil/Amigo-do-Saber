# 🔒 Guia de Segurança e Privacidade

## Proteção de Dados Infantis

Este projeto lida com dados sensíveis de crianças e adolescentes. Seguimos rigorosamente as leis:

- **LGPD** (Lei Geral de Proteção de Dados - Brasil)
- **COPPA** (Children's Online Privacy Protection Act - EUA)
- **Estatuto da Criança e do Adolescente (ECA)**

---

## 🛡️ Arquitetura de Segurança

### 1. Autenticação e Autorização

#### Azure AD B2C

- Autenticação de responsáveis via Azure AD B2C
- Login com email/senha + verificação em 2 fatores (2FA)
- Tokens JWT com expiração de 1 hora
- Refresh tokens com rotação automática

#### Controle de Acesso

```javascript
// Níveis de acesso
const ROLES = {
  RESPONSAVEL: "responsavel", // Acesso total ao perfil do filho
  ALUNO: "aluno", // Acesso limitado ao próprio perfil
  ADMIN: "admin", // Apenas equipe técnica
}
```

### 2. Proteção de Dados

#### Criptografia

**Em Trânsito**

- HTTPS/TLS 1.3 obrigatório
- Certificado SSL gerenciado pelo Azure
- HSTS habilitado

**Em Repouso**

- Cosmos DB com criptografia nativa (AES-256)
- Chaves gerenciadas pelo Azure Key Vault
- Backup automático criptografado

#### Dados Sensíveis

```javascript
// Nunca armazenar:
❌ Senhas em texto plano
❌ CPF completo (apenas últimos 3 dígitos se necessário)
❌ Endereço completo
❌ Dados bancários

// Sempre pseudonimizar:
✅ IDs gerados (UUID v4)
✅ Referências indiretas
✅ Dados agregados para analytics
```

### 3. Consentimento Parental (LGPD/COPPA)

#### Fluxo de Cadastro

1. **Responsável cria conta** → Verifica email
2. **Aceita termos** → Consentimento explícito
3. **Cadastra filho(a)** → Confirma idade
4. **Revisão de privacidade** → Escolhe configurações

#### Gerenciamento de Consentimento

```json
{
  "consentimento": {
    "coletaDados": true,
    "compartilhamentoAnonimo": false,
    "comunicacaoMarketing": false,
    "dataConsentimento": "2025-11-13T10:00:00Z",
    "ipAddress": "hashed",
    "versaoTermos": "1.0"
  }
}
```

---

## 🚨 Moderação de Conteúdo

### Azure Content Safety

Todas as interações com IA são moderadas:

```javascript
const contentCategories = {
  Hate: 2, // Nível de tolerância: baixo
  SelfHarm: 0, // Bloqueio total
  Sexual: 0, // Bloqueio total
  Violence: 2, // Baixa tolerância
}
```

### Filtros de Linguagem

- Palavrões → Bloqueados
- Conteúdo inapropriado → Reportado ao responsável
- Bullying/Assédio → Alerta automático

---

## 🔐 Segurança no Backend

### Azure Functions - Boas Práticas

#### 1. Autenticação de API

```javascript
// Validar token em todas as funções
async function validateToken(req) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return { valid: false, error: "Token ausente" }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return { valid: true, user: decoded }
  } catch (err) {
    return { valid: false, error: "Token inválido" }
  }
}
```

#### 2. Rate Limiting

```javascript
// Limitar requisições por IP/usuário
const rateLimits = {
  cadastro: { max: 5, window: "1h" },
  exercicios: { max: 1000, window: "1d" },
  professoraIA: { max: 50, window: "1h" },
}
```

#### 3. Validação de Input

```javascript
// Sempre sanitizar e validar
const Joi = require('joi');

const alunoSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  idade: Joi.number().min(5).max(18).required(),
  serie: Joi.string().valid('1º Ano', '2º Ano', ...).required()
});
```

#### 4. Segredos e Chaves

**Nunca commitar:**

```bash
# ❌ ERRADO
const cosmosKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";

# ✅ CORRETO
const cosmosKey = process.env.COSMOS_KEY;
```

**Azure Key Vault:**

```javascript
const { SecretClient } = require("@azure/keyvault-secrets")
const { DefaultAzureCredential } = require("@azure/identity")

const client = new SecretClient(
  "https://kv-amigodosaber.vault.azure.net",
  new DefaultAzureCredential()
)

const secret = await client.getSecret("CosmosDBKey")
```

---

## 🌐 Segurança no Frontend

### Content Security Policy (CSP)

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://func-amigodosaber.azurewebsites.net;
    font-src 'self';
    object-src 'none';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  "
/>
```

### XSS Protection

```javascript
// Escapar HTML user-generated
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Usar textContent ao invés de innerHTML
element.textContent = userInput // ✅ Seguro
element.innerHTML = userInput // ❌ Vulnerável a XSS
```

### CORS Seguro

```javascript
// backend/host.json
{
  "extensions": {
    "http": {
      "cors": {
        "allowedOrigins": [
          "https://amigo-do-saber.azurestaticapps.net"
        ],
        "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "allowedHeaders": ["Content-Type", "Authorization"]
      }
    }
  }
}
```

---

## 👀 Monitoramento e Auditoria

### Azure Application Insights

```javascript
const appInsights = require("applicationinsights")
appInsights.setup(process.env.APPINSIGHTS_KEY).start()

// Log de eventos de segurança
appInsights.defaultClient.trackEvent({
  name: "LoginAttempt",
  properties: {
    userId: userId,
    success: true,
    ip: hashedIp,
    timestamp: new Date().toISOString(),
  },
})
```

### Alertas Automáticos

Configure alertas para:

- ✅ Múltiplas tentativas de login falhadas
- ✅ Acesso de IPs suspeitos
- ✅ Alterações em dados de menores
- ✅ Uso anormal da API
- ✅ Erros de autenticação

---

## 📋 Checklist de Segurança

### Antes do Deploy

- [ ] Todas as secrets em variáveis de ambiente
- [ ] HTTPS forçado em todas as rotas
- [ ] CSP configurado no frontend
- [ ] Rate limiting implementado
- [ ] Validação de input em todas as APIs
- [ ] Logs de auditoria funcionando
- [ ] Backup automático configurado
- [ ] Azure AD B2C testado
- [ ] Content Safety ativado
- [ ] CORS restrito a domínios conhecidos

### Auditoria Mensal

- [ ] Revisar logs de acesso
- [ ] Verificar atualizações de segurança
- [ ] Testar backup e restore
- [ ] Validar certificados SSL
- [ ] Revisar permissões de acesso
- [ ] Analisar padrões de uso suspeitos

---

## 🚨 Plano de Resposta a Incidentes

### Passos em Caso de Breach

1. **Contenção Imediata**

   - Revogar tokens comprometidos
   - Bloquear IPs suspeitos
   - Pausar APIs afetadas

2. **Investigação**

   - Analisar logs de auditoria
   - Identificar escopo do incidente
   - Documentar tudo

3. **Notificação**

   - Informar usuários afetados (LGPD)
   - Reportar à ANPD se necessário
   - Comunicar responsáveis

4. **Remediação**

   - Corrigir vulnerabilidade
   - Resetar credenciais
   - Atualizar sistemas

5. **Post-Mortem**
   - Documentar lições aprendidas
   - Atualizar procedimentos
   - Treinar equipe

---

## 📞 Contato de Segurança

Para reportar vulnerabilidades:

- Email: security@amigodosaber.com.br
- Bug Bounty: (se implementar)

**Resposta esperada**: 48 horas

---

## 📚 Recursos Adicionais

- [LGPD - Guia Oficial](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Azure Security Best Practices](https://docs.microsoft.com/azure/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [COPPA Compliance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

---

**Segurança é responsabilidade de todos!** 🔒

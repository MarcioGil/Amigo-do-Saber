# ♿ Guia de Acessibilidade

## Compromisso com Inclusão

**Amigo do Saber** é para todas as crianças, incluindo aquelas com deficiências visuais, auditivas, motoras ou cognitivas.

**Meta**: Conformidade com **WCAG 2.1 Nível AA**

---

## 🎯 Princípios POUR

### 1. **P**erceptível

Os usuários devem conseguir perceber o conteúdo.

### 2. **O**perável

Os usuários devem conseguir operar a interface.

### 3. **U**nderstandable (Compreensível)

Os usuários devem conseguir entender o conteúdo e como usar.

### 4. **R**obust (Robusto)

O conteúdo deve funcionar em diferentes tecnologias assistivas.

---

## 👁️ Acessibilidade Visual

### Contraste de Cores

**Mínimo WCAG AA:**

- Texto normal: contraste 4.5:1
- Texto grande (18pt+): contraste 3:1
- Elementos gráficos: contraste 3:1

```css
/* Paleta de cores acessível */
:root {
  /* Texto sobre fundo claro */
  --text-primary: #1a1a1a; /* Contraste 15.8:1 */
  --text-secondary: #4a4a4a; /* Contraste 8.9:1 */

  /* Texto sobre fundo escuro */
  --text-light: #ffffff; /* Contraste 21:1 */
  --text-light-secondary: #e0e0e0; /* Contraste 11.4:1 */

  /* Cores de destaque */
  --primary: #0066cc; /* Acessível sobre branco */
  --success: #007a33;
  --warning: #996600;
  --error: #cc0000;
}
```

### Modo Alto Contraste

```css
/* Ativado por preferência do usuário */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --background: #ffffff;
    --border: #000000;
  }

  button {
    border: 2px solid #000000;
  }
}
```

### Tamanhos de Fonte Ajustáveis

```javascript
// Controle de tamanho de fonte
const fontSizes = {
  pequeno: "14px",
  medio: "16px", // Padrão
  grande: "20px",
  extraGrande: "24px",
}

function setFontSize(size) {
  document.documentElement.style.fontSize = fontSizes[size]
  localStorage.setItem("fontSize", size)
}
```

### Suporte a Leitores de Tela

#### Textos Alternativos

```html
<!-- Imagens sempre com alt -->
<img src="matematica.svg" alt="Ícone de matemática: calculadora" />

<!-- Ícones decorativos -->
<span class="icon" aria-hidden="true">🎮</span>

<!-- Ícones funcionais -->
<button aria-label="Fechar janela">
  <span aria-hidden="true">✕</span>
</button>
```

#### Live Regions

```html
<!-- Anunciar atualizações dinâmicas -->
<div role="alert" aria-live="assertive">Parabéns! Você ganhou 50 pontos!</div>

<div role="status" aria-live="polite">Carregando próxima questão...</div>
```

#### Landmarks

```html
<header role="banner">
  <nav role="navigation" aria-label="Menu principal">
    <!-- navegação -->
  </nav>
</header>

<main role="main">
  <section aria-labelledby="exercicios-titulo">
    <h2 id="exercicios-titulo">Exercícios de Matemática</h2>
    <!-- conteúdo -->
  </section>
</main>

<aside role="complementary" aria-label="Progresso">
  <!-- informações secundárias -->
</aside>

<footer role="contentinfo">
  <!-- rodapé -->
</footer>
```

---

## ⌨️ Acessibilidade de Teclado

### Navegação Sequencial

```html
<!-- Ordem lógica com tabindex -->
<div class="login-form">
  <input type="email" tabindex="1" aria-label="Email do responsável" />
  <input type="password" tabindex="2" aria-label="Senha" />
  <button tabindex="3">Entrar</button>
  <a href="/recuperar-senha" tabindex="4">Esqueci minha senha</a>
</div>
```

### Atalhos de Teclado

```javascript
// Atalhos globais (com modificador para evitar conflitos)
const shortcuts = {
  "Alt+H": "Ir para Home",
  "Alt+P": "Ver Progresso",
  "Alt+J": "Abrir Jogos",
  "Alt+A": "Falar com Professora",
  "Alt+C": "Falar com Conselheiro",
  Esc: "Fechar modal/overlay",
}

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "h") {
    e.preventDefault()
    navigateTo("/home")
  }
  // ... outros atalhos
})
```

### Indicadores Visuais de Foco

```css
/* Foco visível e customizado */
*:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* Foco apenas por teclado (não mouse) */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* Foco em botões */
button:focus-visible {
  outline: 3px solid #0066cc;
  box-shadow: 0 0 0 5px rgba(0, 102, 204, 0.2);
}
```

### Skip Links

```html
<!-- Permite pular navegação repetitiva -->
<a href="#main-content" class="skip-link"> Pular para conteúdo principal </a>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    z-index: 100;
  }

  .skip-link:focus {
    top: 0;
  }
</style>
```

---

## 🎤 Acessibilidade Auditiva

### Legendas em Vídeos

```html
<video controls>
  <source src="aula-matematica.mp4" type="video/mp4" />
  <track
    kind="subtitles"
    src="legendas-pt.vtt"
    srclang="pt"
    label="Português"
    default
  />
  <track kind="subtitles" src="legendas-en.vtt" srclang="en" label="English" />
</video>
```

### Transcrições de Áudio

```html
<!-- Para áudios da professora virtual -->
<div class="audio-player">
  <audio controls src="explicacao-fracoes.mp3"></audio>
  <details>
    <summary>Ver transcrição</summary>
    <p>Fração é quando dividimos algo em partes iguais...</p>
  </details>
</div>
```

### Alternativas Visuais para Sons

```javascript
// Feedback visual quando há feedback sonoro
function playSound(soundName) {
  // Tocar som
  const audio = new Audio(`/sounds/${soundName}.mp3`)
  audio.play()

  // Feedback visual simultâneo
  showVisualFeedback(soundName)
}

function showVisualFeedback(type) {
  const feedback = {
    acerto: { icon: "✓", color: "green", text: "Correto!" },
    erro: { icon: "✗", color: "red", text: "Ops, tente novamente!" },
    "level-up": { icon: "⬆️", color: "gold", text: "Você subiu de nível!" },
  }

  const config = feedback[type]
  showToast(config.icon, config.text, config.color)
}
```

---

## 🖱️ Acessibilidade Motora

### Áreas de Toque Grandes

```css
/* Mínimo 44x44 pixels (recomendado WCAG) */
button,
a,
input[type="checkbox"],
input[type="radio"] {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}

/* Em mobile, aumentar ainda mais */
@media (max-width: 768px) {
  button,
  a {
    min-height: 48px;
    padding: 16px 28px;
  }
}
```

### Espaçamento Adequado

```css
/* Evitar cliques acidentais */
.button-group button {
  margin: 8px;
}

/* Especialmente importante em jogos */
.game-options .option {
  margin: 16px;
  padding: 20px;
}
```

### Controle de Tempo

```javascript
// Dar tempo suficiente para ler e interagir
const TIMEOUT_DURATION = 120000 // 2 minutos

let timeoutTimer

function resetTimeout() {
  clearTimeout(timeoutTimer)
  timeoutTimer = setTimeout(() => {
    // Avisar antes de deslogar
    showTimeoutWarning()
  }, TIMEOUT_DURATION)
}

function showTimeoutWarning() {
  const modal = showModal({
    title: "Você ainda está aí?",
    message: "Você será desconectado em 1 minuto por inatividade.",
    buttons: [
      { text: "Continuar estudando", action: resetTimeout },
      { text: "Sair", action: logout },
    ],
    autoCloseIn: 60000,
  })
}
```

### Evitar Conteúdo Piscante

```css
/* NUNCA usar animações rápidas */
/* ❌ EVITAR */
.blink {
  animation: blink 0.5s infinite; /* Pode causar convulsões */
}

/* ✅ PERMITIDO */
.gentle-pulse {
  animation: pulse 2s ease-in-out infinite; /* Lento e suave */
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

### Respeitando Preferências do Sistema

```css
/* Desativar animações se usuário preferir */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧠 Acessibilidade Cognitiva

### Linguagem Clara e Simples

```javascript
// ✅ BOM
const messages = {
  erro: "Ops! Algo deu errado. Tente novamente.",
  sucesso: "Você conseguiu! Parabéns!",
  ajuda: "Precisa de ajuda? Clique aqui para falar com a professora.",
}

// ❌ EVITAR
const messages = {
  erro: "Erro 404: Recurso não encontrado no endpoint especificado.",
  sucesso: "Transação processada com êxito no timestamp XXX.",
}
```

### Instruções Passo a Passo

```html
<div class="tutorial">
  <h2>Como fazer este exercício</h2>
  <ol>
    <li>
      <strong>Passo 1:</strong> Leia a pergunta com atenção.
      <span class="icon" aria-hidden="true">📖</span>
    </li>
    <li>
      <strong>Passo 2:</strong> Escolha a resposta que você acha correta.
      <span class="icon" aria-hidden="true">✏️</span>
    </li>
    <li>
      <strong>Passo 3:</strong> Clique no botão "Confirmar".
      <span class="icon" aria-hidden="true">✓</span>
    </li>
  </ol>
</div>
```

### Feedback Imediato e Claro

```javascript
function submitAnswer(questionId, answer) {
  const result = checkAnswer(questionId, answer)

  if (result.correct) {
    showFeedback({
      type: "success",
      icon: "🎉",
      title: "Isso aí!",
      message: "Você acertou! Ganhou 10 pontos.",
      action: "Próxima pergunta",
    })
  } else {
    showFeedback({
      type: "error",
      icon: "💡",
      title: "Quase lá!",
      message: result.hint, // Dica específica
      actions: [
        { text: "Tentar de novo", action: retry },
        { text: "Pedir ajuda", action: askTeacher },
      ],
    })
  }
}
```

### Consistência Visual

```css
/* Manter padrões visuais */
:root {
  /* Cores consistentes */
  --cor-matematica: #0066cc;
  --cor-portugues: #cc0066;
  --cor-ciencias: #00cc66;
  --cor-ingles: #cc6600;

  /* Espaçamentos consistentes */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Tipografia consistente */
  --font-heading: "Poppins", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

---

## 📱 Acessibilidade Mobile

### Design Responsivo

```css
/* Mobile-first approach */
.container {
  padding: 16px;
  font-size: 16px; /* Mínimo para mobile */
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    font-size: 18px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Orientação de Tela

```css
/* Funcionar em ambas orientações */
@media (orientation: portrait) {
  .game-board {
    flex-direction: column;
  }
}

@media (orientation: landscape) {
  .game-board {
    flex-direction: row;
  }
}
```

---

## ✅ Checklist de Acessibilidade

### Antes do Deploy

- [ ] Todas as imagens têm alt text
- [ ] Contraste de cores ≥ 4.5:1
- [ ] Navegação completa por teclado
- [ ] Foco visível em todos os elementos interativos
- [ ] Landmarks semânticos (header, nav, main, etc.)
- [ ] Formulários com labels associados
- [ ] Mensagens de erro descritivas
- [ ] Sem conteúdo piscando < 3x por segundo
- [ ] Respeita prefers-reduced-motion
- [ ] Funciona com zoom até 200%
- [ ] Títulos hierárquicos (h1 → h2 → h3)
- [ ] Skip links implementados
- [ ] ARIA labels onde necessário

### Testes Recomendados

1. **Leitor de Tela**

   - NVDA (Windows) - Gratuito
   - JAWS (Windows)
   - VoiceOver (macOS/iOS) - Nativo
   - TalkBack (Android) - Nativo

2. **Apenas Teclado**

   - Desconectar mouse
   - Navegar apenas com Tab, Enter, Esc, Setas

3. **Simulação de Daltonismo**

   - Chrome DevTools → Rendering → Emulate vision deficiencies

4. **Zoom**

   - Testar com 200% de zoom
   - Verificar se nada quebra

5. **Ferramentas Automáticas**
   - Lighthouse (Chrome DevTools)
   - axe DevTools
   - WAVE (WebAIM)

---

## 📚 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)

---

**Educação acessível é educação de qualidade para todos!** ♿

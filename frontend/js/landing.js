
function getFemaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  // Prioriza voz feminina pt-BR
  return voices.find(v => v.lang === 'pt-BR' && v.name && (v.name.toLowerCase().includes('feminina') || v.name.toLowerCase().includes('mulher') || v.name.toLowerCase().includes('female')))
    || voices.find(v => v.lang === 'pt-BR' && v.gender === 'female')
    || voices.find(v => v.lang === 'pt-BR' && v.voiceURI && (v.voiceURI.toLowerCase().includes('feminina') || v.voiceURI.toLowerCase().includes('mulher') || v.voiceURI.toLowerCase().includes('female')))
    || voices.find(v => v.lang === 'pt-BR')
    || voices.find(v => v.gender === 'female')
    || voices.find(v => v.name && v.name.toLowerCase().includes('female'))
    || voices.find(v => v.name && v.name.toLowerCase().includes('mulher'))
    || voices.find(v => v.name && v.name.toLowerCase().includes('feminina'))
    || null;
}

function speakDora() {
  const text = document.getElementById('speech-text').innerText;
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.05;
    utter.pitch = 1.1;
    utter.voice = getFemaleVoice();
    window.speechSynthesis.speak(utter);
  } else {
    alert('Seu navegador não suporta áudio automático.');
  }
}

// Garante que as vozes estejam carregadas antes de falar
if ('speechSynthesis' in window) {
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function() {
      // Opcional: pode chamar speakDora() automaticamente após vozes carregarem
    };
  }
}

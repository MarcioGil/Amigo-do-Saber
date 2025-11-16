function speakDora() {
  const text = document.getElementById('speech-text').innerText;
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.05;
    utter.pitch = 1.1;
    utter.voice = speechSynthesis.getVoices().find(v => v.lang === 'pt-BR') || null;
    window.speechSynthesis.speak(utter);
  } else {
    alert('Seu navegador não suporta áudio automático.');
  }
}

export function stopVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function playVoice(teks: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  stopVoice();
  const suara = new SpeechSynthesisUtterance(teks);
  suara.lang = "id-ID";
  suara.rate = 1;
  suara.pitch = 1;
  window.speechSynthesis.speak(suara);
}
